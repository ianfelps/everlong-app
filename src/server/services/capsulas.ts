import 'server-only';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/server/db';
import { capsulas } from '@/server/db/schema';
import { errors } from '@/server/lib/http';

// Lista nunca expõe `conteudo` — defesa contra leak acidental.
const COLUNAS_METADATA = {
  id: capsulas.id,
  autorId: capsulas.autorId,
  destinatarioId: capsulas.destinatarioId,
  titulo: capsulas.titulo,
  dataCriacao: capsulas.dataCriacao,
  dataDesbloqueio: capsulas.dataDesbloqueio,
  abertaEm: capsulas.abertaEm,
} as const;

export type CriarCapsulaInput = {
  autorId: string;
  destinatarioId: string | null;
  titulo: string;
  conteudo: string;
  dataDesbloqueio: Date;
};

export async function criarCapsula(input: CriarCapsulaInput) {
  if (input.dataDesbloqueio.getTime() <= Date.now()) {
    throw errors.badRequest(
      'data_desbloqueio precisa ser no futuro',
    );
  }
  const [row] = await db
    .insert(capsulas)
    .values({
      autorId: input.autorId,
      destinatarioId: input.destinatarioId,
      titulo: input.titulo,
      conteudo: input.conteudo,
      dataDesbloqueio: input.dataDesbloqueio,
    })
    .returning(COLUNAS_METADATA);
  return row!;
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

  return row;
}

export async function removerCapsula(id: string): Promise<boolean> {
  const deleted = await db
    .delete(capsulas)
    .where(eq(capsulas.id, id))
    .returning({ id: capsulas.id });
  return deleted.length > 0;
}
