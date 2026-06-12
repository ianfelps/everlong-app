import { describe, expect, it } from 'vitest';
import { tempoAte } from './format';

const AGORA = new Date('2026-06-12T12:00:00.000Z');

describe('tempoAte', () => {
  it('exibe dias quando falta pelo menos um dia', () => {
    expect(tempoAte('2026-06-14T00:00:00.000Z', AGORA)).toEqual({
      valor: 2,
      unidade: 'dias',
    });
  });

  it('exibe horas quando falta menos de um dia', () => {
    expect(tempoAte('2026-06-13T11:30:00.000Z', AGORA)).toEqual({
      valor: 24,
      unidade: 'horas',
    });
  });

  it('exibe minutos quando falta menos de uma hora', () => {
    expect(tempoAte('2026-06-12T12:30:30.000Z', AGORA)).toEqual({
      valor: 31,
      unidade: 'minutos',
    });
  });

  it('usa singular nos limites de uma hora e um minuto', () => {
    expect(tempoAte('2026-06-12T13:00:00.000Z', AGORA)).toEqual({
      valor: 1,
      unidade: 'hora',
    });
    expect(tempoAte('2026-06-12T12:00:30.000Z', AGORA)).toEqual({
      valor: 1,
      unidade: 'minuto',
    });
  });
});
