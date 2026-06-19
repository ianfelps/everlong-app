import 'server-only';
import { env } from '@/env';
import { errors } from '@/server/lib/http';

const BASE_URL = 'https://api.themoviedb.org/3';
const TIMEOUT_MS = 8000;
// título e capa em inglês; sinopse no idioma do app (env.TMDB_LANG, pt-BR)
const LANG_TITULO = 'en-US';

export type FilmeTmdb = {
  tmdbId: number;
  titulo: string;
  posterPath: string | null;
  ano: number | null;
  sinopse: string | null;
};

type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string | null;
  overview?: string | null;
};

function anoDeReleaseDate(date?: string | null): number | null {
  if (!date) return null;
  const ano = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(ano) ? ano : null;
}

function normalizar(movie: TmdbMovie): FilmeTmdb {
  return {
    tmdbId: movie.id,
    titulo: movie.title ?? movie.name ?? 'Sem título',
    posterPath: movie.poster_path ?? null,
    ano: anoDeReleaseDate(movie.release_date),
    sinopse: movie.overview?.trim() || null,
  };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
  language: string = LANG_TITULO,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('language', language);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.TMDB_API_TOKEN}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw errors.badGateway('TMDB indisponível', { cause: String(err) });
  }

  if (res.status === 404) throw errors.notFound('filme não encontrado no TMDB');
  if (!res.ok) {
    throw errors.badGateway(`TMDB respondeu ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function buscarFilmes(
  query: string,
  page = 1,
): Promise<FilmeTmdb[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/search/movie', {
    query,
    page,
    include_adult: 'false',
  });
  return data.results.map(normalizar);
}

export async function filmesPopulares(page = 1): Promise<FilmeTmdb[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/movie/popular', {
    page,
  });
  return data.results.map(normalizar);
}

export async function detalharFilme(tmdbId: number): Promise<FilmeTmdb> {
  // inglês p/ título+capa; pt-BR só p/ sinopse (segundo fetch tolerante a falha)
  const [en, pt] = await Promise.all([
    tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, {}, LANG_TITULO),
    tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, {}, env.TMDB_LANG).catch(
      () => null,
    ),
  ]);
  const base = normalizar(en);
  const sinopsePt = pt?.overview?.trim() || null;
  return { ...base, sinopse: sinopsePt ?? base.sinopse };
}
