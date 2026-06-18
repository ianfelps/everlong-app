import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/env', () => ({
  env: { TMDB_API_TOKEN: 'token-teste', TMDB_LANG: 'pt-BR' },
}));

import { buscarFilmes, detalharFilme, filmesPopulares } from './tmdb';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

describe('buscarFilmes', () => {
  it('normaliza resultados do TMDB', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        results: [
          {
            id: 603,
            title: 'Matrix',
            poster_path: '/abc.jpg',
            release_date: '1999-03-31',
            overview: 'Hacker descobre a verdade.',
          },
        ],
      }),
    );

    const filmes = await buscarFilmes('matrix');
    expect(filmes).toEqual([
      {
        tmdbId: 603,
        titulo: 'Matrix',
        posterPath: '/abc.jpg',
        ano: 1999,
        sinopse: 'Hacker descobre a verdade.',
      },
    ]);
    // envia bearer token
    const init = fetchMock.mock.calls[0]![1];
    expect(init.headers.Authorization).toBe('Bearer token-teste');
  });

  it('trata campos ausentes (poster/overview/data)', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({ results: [{ id: 1, title: 'X' }] }),
    );
    const [filme] = await buscarFilmes('x');
    expect(filme).toMatchObject({ posterPath: null, ano: null, sinopse: null });
  });
});

describe('filmesPopulares', () => {
  it('busca /movie/popular e normaliza', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({ results: [{ id: 42, title: 'Pop', poster_path: '/p.jpg' }] }),
    );
    const filmes = await filmesPopulares();
    expect(filmes).toEqual([
      { tmdbId: 42, titulo: 'Pop', posterPath: '/p.jpg', ano: null, sinopse: null },
    ]);
    const url = fetchMock.mock.calls[0]![0] as URL;
    expect(url.pathname).toContain('/movie/popular');
  });
});

describe('detalharFilme', () => {
  it('lança 502 quando TMDB responde erro', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    await expect(detalharFilme(603)).rejects.toMatchObject({
      status: 502,
      code: 'BAD_GATEWAY',
    });
  });

  it('lança 404 quando filme não existe no TMDB', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    });
    await expect(detalharFilme(0)).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });
});
