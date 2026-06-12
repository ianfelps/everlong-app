import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/server/db', () => ({
  db: {
    select: mocks.select,
  },
}));
vi.mock('./drive', () => ({
  deleteFoto: vi.fn(),
  uploadFoto: vi.fn(),
}));

import { obterFotoAleatoria } from './fotos';

describe('obterFotoAleatoria', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('retorna null sem executar a consulta por offset quando o álbum está vazio', async () => {
    mocks.select.mockReturnValueOnce({
      from: () => Promise.resolve([{ total: 0 }]),
    });

    await expect(obterFotoAleatoria()).resolves.toBeNull();
    expect(mocks.select).toHaveBeenCalledOnce();
  });

  it('busca uma foto usando um offset aleatório dentro da contagem', async () => {
    const foto = { id: 'foto-4' };
    const offset = vi.fn().mockResolvedValue([foto]);
    const limit = vi.fn(() => ({ offset }));
    vi.spyOn(Math, 'random').mockReturnValue(0.75);
    mocks.select
      .mockReturnValueOnce({
        from: () => Promise.resolve([{ total: 4 }]),
      })
      .mockReturnValueOnce({
        from: () => ({ limit }),
      });

    await expect(obterFotoAleatoria()).resolves.toBe(foto);
    expect(limit).toHaveBeenCalledWith(1);
    expect(offset).toHaveBeenCalledWith(3);
  });
});
