import 'server-only';
import { asc, desc, eq, gte, sql } from 'drizzle-orm';
import {
  inicioJanelaRecados,
  RECADO_LIMITE,
} from '@/lib/recados';
import { db } from '@/server/db';
import {
  assistidosJuntos,
  configCasal,
  eventos,
  filmeAvaliacoes,
  filmeFavoritos,
  filmes,
  perfis,
  recados,
} from '@/server/db/schema';

export async function mapaPerfis(): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: perfis.id, nome: perfis.nome })
    .from(perfis);
  return new Map(rows.map((r) => [r.id, r.nome]));
}

export async function nomesCasal(): Promise<string[]> {
  const rows = await db
    .select({ nome: perfis.nome })
    .from(perfis)
    .orderBy(asc(perfis.createdAt));
  return rows.map((r) => r.nome);
}

export async function obterCartaSecreta(): Promise<string | null> {
  const [row] = await db
    .select({ cartaSecreta: configCasal.cartaSecreta })
    .from(configCasal)
    .limit(1);
  return row?.cartaSecreta ?? null;
}

export async function obterSpotifyPlaylistId(): Promise<string | null> {
  const [row] = await db
    .select({ spotifyPlaylistId: configCasal.spotifyPlaylistId })
    .from(configCasal)
    .limit(1);
  return row?.spotifyPlaylistId?.trim() || null;
}

export async function listarRecados(
  ordem: 'asc' | 'desc' = 'desc',
  agora: Date = new Date(),
) {
  const rows = await db
    .select()
    .from(recados)
    .where(gte(recados.createdAt, inicioJanelaRecados(agora)))
    .orderBy(desc(recados.createdAt))
    .limit(RECADO_LIMITE);

  return ordem === 'asc' ? rows.reverse() : rows;
}

export async function listarEventos() {
  return db.select().from(eventos).orderBy(asc(eventos.dataEvento));
}

export async function listarCatalogo() {
  return db.select().from(filmes).orderBy(desc(filmes.createdAt));
}

export async function listarFavoritos(autorId?: string) {
  const q = db
    .select({
      id: filmeFavoritos.id,
      filmeId: filmeFavoritos.filmeId,
      autorId: filmeFavoritos.autorId,
      createdAt: filmeFavoritos.createdAt,
    })
    .from(filmeFavoritos)
    .orderBy(desc(filmeFavoritos.createdAt));
  return autorId
    ? q.where(eq(filmeFavoritos.autorId, autorId))
    : q;
}

export async function listarAssistidosJuntos() {
  return db
    .select({
      id: assistidosJuntos.id,
      filmeId: assistidosJuntos.filmeId,
      dataAssistido: assistidosJuntos.dataAssistido,
      createdAt: assistidosJuntos.createdAt,
      titulo: filmes.titulo,
      posterPath: filmes.posterPath,
      ano: filmes.ano,
    })
    .from(assistidosJuntos)
    .innerJoin(filmes, eq(assistidosJuntos.filmeId, filmes.id))
    .orderBy(sql`${assistidosJuntos.dataAssistido} desc nulls last`);
}

export async function obterFilmeComAgregados(filmeId: string) {
  const [filme] = await db
    .select()
    .from(filmes)
    .where(eq(filmes.id, filmeId))
    .limit(1);
  if (!filme) return null;

  const [avaliacoes, favoritos, [assistido]] = await Promise.all([
    db
      .select()
      .from(filmeAvaliacoes)
      .where(eq(filmeAvaliacoes.filmeId, filmeId))
      .orderBy(asc(filmeAvaliacoes.createdAt)),
    db
      .select()
      .from(filmeFavoritos)
      .where(eq(filmeFavoritos.filmeId, filmeId)),
    db
      .select()
      .from(assistidosJuntos)
      .where(eq(assistidosJuntos.filmeId, filmeId))
      .limit(1),
  ]);

  return {
    ...filme,
    avaliacoes,
    favoritos,
    assistidoJunto: assistido ?? null,
  };
}
