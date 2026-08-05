import 'server-only';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  ne,
  or,
  sql,
} from 'drizzle-orm';
import {
  inicioJanelaRecados,
  RECADO_FIXADO_LIMITE,
  RECADO_LIMITE,
  RECADO_RECENTE_LIMITE,
} from '@/lib/recados';
import { db } from '@/server/db';
import {
  assistidosJuntos,
  capsulas,
  configCasal,
  eventos,
  filmeAvaliacoes,
  filmeFavoritos,
  filmeWatchlist,
  filmes,
  perfis,
  recadoCurtidas,
  recados,
} from '@/server/db/schema';
import { errors } from '@/server/lib/http';

export type RecadoComEstado = typeof recados.$inferSelect & {
  curtidas: number;
  curtidoPorMim: boolean;
};

type CursorRecado = { createdAt: Date; id: string };

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

async function adicionarEstadoRecados(
  rows: (typeof recados.$inferSelect)[],
  perfilId: string,
): Promise<RecadoComEstado[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const curtidas = await db
    .select({ recadoId: recadoCurtidas.recadoId, autorId: recadoCurtidas.autorId })
    .from(recadoCurtidas)
    .where(inArray(recadoCurtidas.recadoId, ids));

  const curtidasPorRecado = new Map<string, number>();
  const curtidasProprias = new Set<string>();
  for (const curtida of curtidas) {
    curtidasPorRecado.set(
      curtida.recadoId,
      (curtidasPorRecado.get(curtida.recadoId) ?? 0) + 1,
    );
    if (curtida.autorId === perfilId) curtidasProprias.add(curtida.recadoId);
  }

  return rows.map((row) => ({
    ...row,
    curtidas: curtidasPorRecado.get(row.id) ?? 0,
    curtidoPorMim: curtidasProprias.has(row.id),
  }));
}

export async function obterRecadoComEstado(id: string, perfilId: string) {
  const [row] = await db.select().from(recados).where(eq(recados.id, id)).limit(1);
  if (!row) throw errors.notFound('recado não encontrado');
  const [recado] = await adicionarEstadoRecados([row], perfilId);
  return recado!;
}

export async function listarRecadosDoMural(perfilId: string, agora = new Date()) {
  const inicio = inicioJanelaRecados(agora);
  const [fixados, recentes] = await Promise.all([
    db
      .select()
      .from(recados)
      .where(isNotNull(recados.fixadoEm))
      .orderBy(desc(recados.fixadoEm), desc(recados.id))
      .limit(RECADO_FIXADO_LIMITE),
    db
      .select()
      .from(recados)
      .where(and(gte(recados.createdAt, inicio), isNull(recados.fixadoEm)))
      .orderBy(desc(recados.createdAt), desc(recados.id))
      .limit(RECADO_RECENTE_LIMITE),
  ]);

  return adicionarEstadoRecados([...fixados, ...recentes], perfilId);
}

export async function listarArquivoRecados(
  perfilId: string,
  input: { limit: number; cursor?: CursorRecado },
  agora = new Date(),
) {
  const condicoes = [
    lt(recados.createdAt, inicioJanelaRecados(agora)),
    isNull(recados.fixadoEm),
  ];
  if (input.cursor) {
    condicoes.push(
      or(
        lt(recados.createdAt, input.cursor.createdAt),
        and(
          eq(recados.createdAt, input.cursor.createdAt),
          lt(recados.id, input.cursor.id),
        ),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(recados)
    .where(and(...condicoes))
    .orderBy(desc(recados.createdAt), desc(recados.id))
    .limit(input.limit + 1);
  const items = rows.slice(0, input.limit);
  const last = items[items.length - 1];

  return {
    items: await adicionarEstadoRecados(items, perfilId),
    nextCursor:
      rows.length > input.limit && last
        ? { createdAt: last.createdAt, id: last.id }
        : null,
  };
}

export async function definirRecadoFixado(id: string, fixado: boolean) {
  const [existente] = await db
    .select({ fixadoEm: recados.fixadoEm })
    .from(recados)
    .where(eq(recados.id, id))
    .limit(1);
  if (!existente) throw errors.notFound('recado não encontrado');

  if (fixado && !existente.fixadoEm) {
    const [resultado] = await db
      .select({ total: count() })
      .from(recados)
      .where(isNotNull(recados.fixadoEm));
    if (Number(resultado?.total ?? 0) >= RECADO_FIXADO_LIMITE) {
      throw errors.conflict('limite de quatro recados fixados atingido');
    }
  }

  const [row] = await db
    .update(recados)
    .set({ fixadoEm: fixado ? new Date() : null })
    .where(eq(recados.id, id))
    .returning();
  if (!row) throw errors.notFound('recado não encontrado');
  return row;
}

export async function curtirRecado(id: string, autorId: string) {
  await obterRecadoComEstado(id, autorId);
  const [row] = await db
    .insert(recadoCurtidas)
    .values({ recadoId: id, autorId })
    .onConflictDoNothing({
      target: [recadoCurtidas.recadoId, recadoCurtidas.autorId],
    })
    .returning();
  return row ?? null;
}

export async function removerCurtidaDoRecado(id: string, autorId: string) {
  await db
    .delete(recadoCurtidas)
    .where(and(eq(recadoCurtidas.recadoId, id), eq(recadoCurtidas.autorId, autorId)));
}

export async function marcarRecadosComoLidos(ids: string[], perfilId: string) {
  if (ids.length === 0) return [];
  const atualizados = await db
    .update(recados)
    .set({ lidoEm: new Date() })
    .where(
      and(
        inArray(recados.id, ids),
        ne(recados.autorId, perfilId),
        isNull(recados.lidoEm),
      ),
    )
    .returning({ id: recados.id });
  return atualizados.map((row) => row.id);
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

export async function listarCatalogoComResumo() {
  const [filmesRows, avaliacoes, favoritos, assistidos, watchlist] =
    await Promise.all([
      db.select().from(filmes).orderBy(desc(filmes.createdAt)),
      db.select().from(filmeAvaliacoes),
      db.select().from(filmeFavoritos),
      db.select().from(assistidosJuntos),
      db.select().from(filmeWatchlist),
    ]);

  const avalPorFilme = new Map<string, typeof avaliacoes>();
  for (const a of avaliacoes) {
    const lista = avalPorFilme.get(a.filmeId) ?? [];
    lista.push(a);
    avalPorFilme.set(a.filmeId, lista);
  }
  const favPorFilme = new Map<string, typeof favoritos>();
  for (const f of favoritos) {
    const lista = favPorFilme.get(f.filmeId) ?? [];
    lista.push(f);
    favPorFilme.set(f.filmeId, lista);
  }
  const assistidoPorFilme = new Map(assistidos.map((a) => [a.filmeId, a]));
  const naWatchlist = new Set(watchlist.map((w) => w.filmeId));

  return filmesRows.map((filme) => ({
    ...filme,
    avaliacoes: avalPorFilme.get(filme.id) ?? [],
    favoritos: favPorFilme.get(filme.id) ?? [],
    assistidoJunto: assistidoPorFilme.get(filme.id) ?? null,
    naWatchlist: naWatchlist.has(filme.id),
  }));
}

export async function obterFilmeComAgregados(filmeId: string) {
  const [filme] = await db
    .select()
    .from(filmes)
    .where(eq(filmes.id, filmeId))
    .limit(1);
  if (!filme) return null;

  const [avaliacoes, favoritos, [assistido], [watch]] = await Promise.all([
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
    db
      .select({ id: filmeWatchlist.id })
      .from(filmeWatchlist)
      .where(eq(filmeWatchlist.filmeId, filmeId))
      .limit(1),
  ]);

  return {
    ...filme,
    avaliacoes,
    favoritos,
    assistidoJunto: assistido ?? null,
    naWatchlist: watch != null,
  };
}
