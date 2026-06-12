import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  delete: vi.fn(),
  deleteFoto: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/server/db', () => ({
  db: {
    select: mocks.select,
    delete: mocks.delete,
  },
}));
vi.mock('./drive', () => ({
  deleteFoto: mocks.deleteFoto,
  uploadFoto: vi.fn(),
}));

import { removerCapsula } from './capsulas';

function selecaoComLimite(rows: unknown[]) {
  return {
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve(rows),
      }),
    }),
  };
}

function selecao(rows: unknown[]) {
  return {
    from: () => ({
      where: () => Promise.resolve(rows),
    }),
  };
}

describe('removerCapsula', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 409 e não remove uma cápsula que nunca foi aberta', async () => {
    mocks.select.mockReturnValueOnce(selecaoComLimite([{ abertaEm: null }]));

    await expect(removerCapsula('capsula-1')).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
    });
    expect(mocks.delete).not.toHaveBeenCalled();
    expect(mocks.deleteFoto).not.toHaveBeenCalled();
  });

  it('remove a cápsula aberta e limpa suas fotos do Drive', async () => {
    mocks.select
      .mockReturnValueOnce(
        selecaoComLimite([{ abertaEm: new Date('2026-06-12T15:00:00.000Z') }]),
      )
      .mockReturnValueOnce(selecao([{ driveFileId: 'drive-1' }]));
    mocks.delete.mockReturnValue({
      where: () => ({
        returning: () => Promise.resolve([{ id: 'capsula-1' }]),
      }),
    });
    mocks.deleteFoto.mockResolvedValue(undefined);

    await expect(removerCapsula('capsula-1')).resolves.toBe(true);
    expect(mocks.delete).toHaveBeenCalledOnce();
    expect(mocks.deleteFoto).toHaveBeenCalledWith('drive-1');
  });
});
