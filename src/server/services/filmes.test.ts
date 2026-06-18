import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  detalharFilme: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/server/db', () => ({
  db: { select: mocks.select, insert: mocks.insert, delete: mocks.delete },
}));
vi.mock('./tmdb', () => ({ detalharFilme: mocks.detalharFilme }));

import {
  adicionarFilmeAoCatalogo,
  removerAvaliacaoPropria,
  upsertAvaliacao,
} from './filmes';

// db.select().from().where().limit() → Promise
function selecao(rows: unknown[]) {
  return {
    from: () => ({
      where: () => ({ limit: () => Promise.resolve(rows) }),
    }),
  };
}

// db.insert().values().onConflictDo*().returning() → Promise
function insertRetornando(rows: unknown[]) {
  const ret = { returning: () => Promise.resolve(rows) };
  return {
    values: () => ({
      onConflictDoNothing: () => ret,
      onConflictDoUpdate: () => ret,
      returning: ret.returning,
    }),
  };
}

// db.delete().where().returning() → Promise
function deleteRetornando(rows: unknown[]) {
  return { where: () => ({ returning: () => Promise.resolve(rows) }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('adicionarFilmeAoCatalogo', () => {
  it('é idempotente: retorna existente sem chamar TMDB nem inserir', async () => {
    const existente = { id: 'f1', tmdbId: 603, titulo: 'Matrix' };
    mocks.select.mockReturnValueOnce(selecao([existente]));

    const row = await adicionarFilmeAoCatalogo(603, 'perfil-1');

    expect(row).toBe(existente);
    expect(mocks.detalharFilme).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('busca no TMDB e insere quando filme é novo', async () => {
    const novo = { id: 'f2', tmdbId: 550, titulo: 'Clube da Luta' };
    mocks.select.mockReturnValueOnce(selecao([]));
    mocks.detalharFilme.mockResolvedValueOnce({
      tmdbId: 550,
      titulo: 'Clube da Luta',
      posterPath: '/p.jpg',
      ano: 1999,
      sinopse: 's',
    });
    mocks.insert.mockReturnValueOnce(insertRetornando([novo]));

    const row = await adicionarFilmeAoCatalogo(550, 'perfil-1');

    expect(mocks.detalharFilme).toHaveBeenCalledWith(550);
    expect(row).toBe(novo);
  });
});

describe('upsertAvaliacao', () => {
  it('grava avaliação quando o filme existe', async () => {
    const aval = { id: 'a1', filmeId: 'f1', autorId: 'perfil-1', nota: 5 };
    mocks.select.mockReturnValueOnce(selecao([{ id: 'f1' }]));
    mocks.insert.mockReturnValueOnce(insertRetornando([aval]));

    const row = await upsertAvaliacao({
      filmeId: 'f1',
      autorId: 'perfil-1',
      nota: 5,
      texto: 'ótimo',
    });

    expect(row).toBe(aval);
  });

  it('404 quando o filme não existe', async () => {
    mocks.select.mockReturnValueOnce(selecao([]));
    await expect(
      upsertAvaliacao({ filmeId: 'x', autorId: 'p', nota: 3 }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe('removerAvaliacaoPropria', () => {
  it('404 quando o perfil não tem avaliação nesse filme', async () => {
    mocks.delete.mockReturnValueOnce(deleteRetornando([]));
    await expect(
      removerAvaliacaoPropria('f1', 'perfil-1'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('remove avaliação própria', async () => {
    mocks.delete.mockReturnValueOnce(deleteRetornando([{ id: 'a1' }]));
    await expect(removerAvaliacaoPropria('f1', 'perfil-1')).resolves.toBe(true);
  });
});
