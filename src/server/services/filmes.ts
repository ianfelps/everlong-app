import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import {
  assistidosJuntos,
  filmeAvaliacoes,
  filmeFavoritos,
  filmes,
} from '@/server/db/schema';
import { errors } from '@/server/lib/http';
import { detalharFilme } from './tmdb';

export async function adicionarFilmeAoCatalogo(
  tmdbId: number,
  adicionadoPor: string,
) {
  const [existente] = await db
    .select()
    .from(filmes)
    .where(eq(filmes.tmdbId, tmdbId))
    .limit(1);
  if (existente) return existente;

  const dados = await detalharFilme(tmdbId);
  const [row] = await db
    .insert(filmes)
    .values({
      tmdbId: dados.tmdbId,
      titulo: dados.titulo,
      posterPath: dados.posterPath,
      ano: dados.ano,
      sinopse: dados.sinopse,
      adicionadoPor,
    })
    .onConflictDoNothing({ target: filmes.tmdbId })
    .returning();

  // corrida: outro insert ganhou; relê o registro existente.
  if (!row) {
    const [vencedor] = await db
      .select()
      .from(filmes)
      .where(eq(filmes.tmdbId, tmdbId))
      .limit(1);
    if (!vencedor) throw new Error('falha ao adicionar filme ao catálogo');
    return vencedor;
  }
  return row;
}

export type UpsertAvaliacaoInput = {
  filmeId: string;
  autorId: string;
  nota: number;
  texto?: string | null;
};

export async function upsertAvaliacao(input: UpsertAvaliacaoInput) {
  await garantirFilmeExiste(input.filmeId);
  const [row] = await db
    .insert(filmeAvaliacoes)
    .values({
      filmeId: input.filmeId,
      autorId: input.autorId,
      nota: input.nota,
      texto: input.texto ?? null,
    })
    .onConflictDoUpdate({
      target: [filmeAvaliacoes.filmeId, filmeAvaliacoes.autorId],
      set: { nota: input.nota, texto: input.texto ?? null, updatedAt: new Date() },
    })
    .returning();
  return row;
}

export async function removerAvaliacaoPropria(filmeId: string, autorId: string) {
  const deleted = await db
    .delete(filmeAvaliacoes)
    .where(
      and(
        eq(filmeAvaliacoes.filmeId, filmeId),
        eq(filmeAvaliacoes.autorId, autorId),
      ),
    )
    .returning({ id: filmeAvaliacoes.id });
  if (deleted.length === 0) throw errors.notFound('avaliação não encontrada');
  return true;
}

export async function definirFavorito(filmeId: string, autorId: string) {
  await garantirFilmeExiste(filmeId);
  const [row] = await db
    .insert(filmeFavoritos)
    .values({ filmeId, autorId })
    .onConflictDoNothing({
      target: [filmeFavoritos.filmeId, filmeFavoritos.autorId],
    })
    .returning();
  if (row) return row;
  const [existente] = await db
    .select()
    .from(filmeFavoritos)
    .where(
      and(
        eq(filmeFavoritos.filmeId, filmeId),
        eq(filmeFavoritos.autorId, autorId),
      ),
    )
    .limit(1);
  return existente;
}

export async function removerFavorito(filmeId: string, autorId: string) {
  await db
    .delete(filmeFavoritos)
    .where(
      and(
        eq(filmeFavoritos.filmeId, filmeId),
        eq(filmeFavoritos.autorId, autorId),
      ),
    );
  return true;
}

export async function marcarAssistidoJunto(
  filmeId: string,
  dataAssistido?: Date | null,
) {
  await garantirFilmeExiste(filmeId);
  const [row] = await db
    .insert(assistidosJuntos)
    .values({ filmeId, dataAssistido: dataAssistido ?? null })
    .onConflictDoUpdate({
      target: assistidosJuntos.filmeId,
      set: { dataAssistido: dataAssistido ?? null },
    })
    .returning();
  return row;
}

export async function desmarcarAssistidoJunto(filmeId: string) {
  await db
    .delete(assistidosJuntos)
    .where(eq(assistidosJuntos.filmeId, filmeId));
  return true;
}

async function garantirFilmeExiste(filmeId: string) {
  const [row] = await db
    .select({ id: filmes.id })
    .from(filmes)
    .where(eq(filmes.id, filmeId))
    .limit(1);
  if (!row) throw errors.notFound('filme não encontrado');
}

export async function removerFilme(filmeId: string) {
  const deleted = await db
    .delete(filmes)
    .where(eq(filmes.id, filmeId))
    .returning({ id: filmes.id });
  return deleted.length > 0;
}
