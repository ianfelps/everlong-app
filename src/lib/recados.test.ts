import { describe, expect, it } from 'vitest';
import {
  inicioJanelaRecados,
  limitarRecados,
  RECADO_DURACAO_MS,
  RECADO_LIMITE,
} from './recados';

describe('política de recados', () => {
  it('calcula uma janela móvel inclusiva de sete dias', () => {
    const agora = new Date('2026-06-12T15:00:00.000Z');

    expect(inicioJanelaRecados(agora).getTime()).toBe(
      agora.getTime() - RECADO_DURACAO_MS,
    );
  });

  it('mantém somente os oito mais recentes em ordem decrescente', () => {
    const recados = Array.from({ length: 10 }, (_, i) => i);

    expect(limitarRecados(recados, 'desc')).toEqual(
      recados.slice(0, RECADO_LIMITE),
    );
  });

  it('mantém somente os oito mais recentes em ordem crescente', () => {
    const recados = Array.from({ length: 10 }, (_, i) => i);

    expect(limitarRecados(recados, 'asc')).toEqual(
      recados.slice(-RECADO_LIMITE),
    );
  });
});
