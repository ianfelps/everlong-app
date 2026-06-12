import { describe, expect, it } from 'vitest';
import { podeExcluirCapsula } from './capsulas';

describe('política de exclusão de cápsulas', () => {
  it('impede excluir uma cápsula que nunca foi aberta', () => {
    expect(podeExcluirCapsula(null)).toBe(false);
  });

  it('permite excluir uma cápsula depois da primeira abertura', () => {
    expect(podeExcluirCapsula(new Date('2026-06-12T15:00:00.000Z'))).toBe(true);
  });
});
