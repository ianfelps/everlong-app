import 'server-only';
import { and, asc, count, desc, eq, lt, or, sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { fotos } from '@/server/db/schema';
import { deleteFoto, uploadFoto } from './drive';

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]);

export const FotoLimits = { MAX_BYTES, ALLOWED } as const;

export type CriarFotoInput = {
  file: File;
  autorId: string;
  legenda: string | null;
  tiradaEm: Date | null;
};

export async function criarFoto(input: CriarFotoInput) {
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const { id: driveFileId, size } = await uploadFoto({
    buffer,
    mimeType: input.file.type,
    filename: input.file.name,
  });

  try {
    const [row] = await db
      .insert(fotos)
      .values({
        driveFileId,
        autorId: input.autorId,
        mimeType: input.file.type,
        tamanhoBytes: BigInt(size),
        legenda: input.legenda,
        tiradaEm: input.tiradaEm,
      })
      .returning();
    return row!;
  } catch (err) {
    // rollback no Drive caso DB falhe
    await deleteFoto(driveFileId).catch((e) =>
      console.error('[fotos] rollback drive falhou', e),
    );
    throw err;
  }
}

export type ListarFotosInput = {
  limit: number;
  cursor?: { uploadedAt: Date; id: string };
};

export async function listarFotos(input: ListarFotosInput) {
  const conds = [];
  if (input.cursor) {
    conds.push(
      or(
        lt(fotos.uploadedAt, input.cursor.uploadedAt),
        and(
          eq(fotos.uploadedAt, input.cursor.uploadedAt),
          lt(fotos.id, input.cursor.id),
        ),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(fotos)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(fotos.uploadedAt), desc(fotos.id))
    .limit(input.limit + 1);

  const items = rows.slice(0, input.limit);
  const last = items[items.length - 1];
  const nextCursor =
    rows.length > input.limit && last
      ? { uploadedAt: last.uploadedAt, id: last.id }
      : null;

  return { items, nextCursor };
}

export async function listarFotosCronologicas() {
  return db
    .select()
    .from(fotos)
    .orderBy(
      asc(sql`coalesce(${fotos.tiradaEm}, ${fotos.uploadedAt})`),
      asc(fotos.id),
    );
}

export async function listarFotosPorDataTirada() {
  return db
    .select()
    .from(fotos)
    .orderBy(
      sql`${fotos.tiradaEm} desc nulls last`,
      desc(fotos.uploadedAt),
      desc(fotos.id),
    );
}

export async function obterFotoAleatoria() {
  const [resultado] = await db
    .select({ total: count() })
    .from(fotos);
  const total = Number(resultado?.total ?? 0);
  if (!Number.isFinite(total) || total <= 0) return null;

  const indice = Math.floor(Math.random() * total);
  const [row] = await db
    .select()
    .from(fotos)
    .orderBy(asc(fotos.id))
    .limit(1)
    .offset(indice);
  return row ?? null;
}

export async function obterFoto(id: string) {
  const [row] = await db.select().from(fotos).where(eq(fotos.id, id)).limit(1);
  return row ?? null;
}

export type AtualizarFotoInput = {
  legenda?: string | null;
  tiradaEm?: Date | null;
};

export async function atualizarFoto(id: string, input: AtualizarFotoInput) {
  const patch: Record<string, unknown> = {};
  if (input.legenda !== undefined) patch.legenda = input.legenda;
  if (input.tiradaEm !== undefined) patch.tiradaEm = input.tiradaEm;
  if (Object.keys(patch).length === 0) return obterFoto(id);

  const [row] = await db
    .update(fotos)
    .set(patch)
    .where(eq(fotos.id, id))
    .returning();
  return row ?? null;
}

export async function removerFoto(id: string): Promise<boolean> {
  const foto = await obterFoto(id);
  if (!foto) return false;
  await deleteFoto(foto.driveFileId);
  await db.delete(fotos).where(eq(fotos.id, id));
  return true;
}
