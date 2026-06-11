import 'server-only';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/server/db';
import { capsulaFotos, capsulas } from '@/server/db/schema';
import { errors } from '@/server/lib/http';
import { deleteFoto, uploadFoto } from './drive';

// Lista nunca expõe `conteudo` — defesa contra leak acidental.
const COLUNAS_METADATA = {
  id: capsulas.id,
  autorId: capsulas.autorId,
  titulo: capsulas.titulo,
  dataCriacao: capsulas.dataCriacao,
  dataDesbloqueio: capsulas.dataDesbloqueio,
  abertaEm: capsulas.abertaEm,
} as const;

export type CriarCapsulaInput = {
  autorId: string;
  titulo: string;
  conteudo: string;
  dataDesbloqueio: Date;
  fotos?: File[];
};

export async function criarCapsula(input: CriarCapsulaInput) {
  if (input.dataDesbloqueio.getTime() <= Date.now()) {
    throw errors.badRequest(
      'data_desbloqueio precisa ser no futuro',
    );
  }
  const uploaded: Array<{
    driveFileId: string;
    mimeType: string;
    tamanhoBytes: bigint;
  }> = [];

  try {
    for (const file of input.fotos ?? []) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { id: driveFileId, size } = await uploadFoto({
        buffer,
        mimeType: file.type,
        filename: file.name,
      });
      uploaded.push({
        driveFileId,
        mimeType: file.type,
        tamanhoBytes: BigInt(size),
      });
    }

    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(capsulas)
        .values({
          autorId: input.autorId,
          titulo: input.titulo,
          conteudo: input.conteudo,
          dataDesbloqueio: input.dataDesbloqueio,
        })
        .returning(COLUNAS_METADATA);

      if (!row) throw new Error('falha ao criar cápsula');

      if (uploaded.length > 0) {
        await tx.insert(capsulaFotos).values(
          uploaded.map((f) => ({
            capsulaId: row.id,
            driveFileId: f.driveFileId,
            mimeType: f.mimeType,
            tamanhoBytes: f.tamanhoBytes,
          })),
        );
      }

      return row;
    });
  } catch (err) {
    await Promise.allSettled(uploaded.map((f) => deleteFoto(f.driveFileId)));
    throw err;
  }
}

export async function listarCapsulas() {
  return db
    .select(COLUNAS_METADATA)
    .from(capsulas)
    .orderBy(desc(capsulas.dataDesbloqueio));
}

export async function obterCapsula(id: string, agora: Date = new Date()) {
  const [row] = await db
    .select()
    .from(capsulas)
    .where(eq(capsulas.id, id))
    .limit(1);
  if (!row) return null;

  if (row.dataDesbloqueio > agora) {
    throw errors.locked('cápsula ainda bloqueada', {
      data_desbloqueio: row.dataDesbloqueio.toISOString(),
    });
  }

  // primeira leitura pós-desbloqueio → marca aberta_em
  if (!row.abertaEm) {
    await db
      .update(capsulas)
      .set({ abertaEm: agora })
      .where(and(eq(capsulas.id, id), isNull(capsulas.abertaEm)));
    row.abertaEm = agora;
  }

  const fotos = await db
    .select({
      id: capsulaFotos.id,
      capsulaId: capsulaFotos.capsulaId,
      mimeType: capsulaFotos.mimeType,
      tamanhoBytes: capsulaFotos.tamanhoBytes,
      legenda: capsulaFotos.legenda,
      createdAt: capsulaFotos.createdAt,
    })
    .from(capsulaFotos)
    .where(eq(capsulaFotos.capsulaId, id))
    .orderBy(asc(capsulaFotos.createdAt));

  return { ...row, fotos };
}

export async function obterFotoCapsula(
  capsulaId: string,
  fotoId: string,
  agora: Date = new Date(),
) {
  const [row] = await db
    .select({
      id: capsulaFotos.id,
      capsulaId: capsulaFotos.capsulaId,
      driveFileId: capsulaFotos.driveFileId,
      mimeType: capsulaFotos.mimeType,
      dataDesbloqueio: capsulas.dataDesbloqueio,
    })
    .from(capsulaFotos)
    .innerJoin(capsulas, eq(capsulaFotos.capsulaId, capsulas.id))
    .where(and(eq(capsulaFotos.capsulaId, capsulaId), eq(capsulaFotos.id, fotoId)))
    .limit(1);

  if (!row) return null;
  if (row.dataDesbloqueio > agora) {
    throw errors.locked('cápsula ainda bloqueada', {
      data_desbloqueio: row.dataDesbloqueio.toISOString(),
    });
  }

  return row;
}

export async function removerCapsula(id: string): Promise<boolean> {
  const fotos = await db
    .select({ driveFileId: capsulaFotos.driveFileId })
    .from(capsulaFotos)
    .where(eq(capsulaFotos.capsulaId, id));

  const deleted = await db
    .delete(capsulas)
    .where(eq(capsulas.id, id))
    .returning({ id: capsulas.id });
  if (deleted.length === 0) return false;

  const cleanup = await Promise.allSettled(
    fotos.map((foto) => deleteFoto(foto.driveFileId)),
  );
  cleanup.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        '[capsulas] cleanup drive falhou',
        fotos[index]?.driveFileId,
        result.reason,
      );
    }
  });

  return true;
}
