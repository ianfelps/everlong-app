export const RECADO_LIMITE = 8;
export const RECADO_DURACAO_MS = 7 * 24 * 60 * 60 * 1000;

export function inicioJanelaRecados(agora: Date = new Date()): Date {
  return new Date(agora.getTime() - RECADO_DURACAO_MS);
}

export function limitarRecados<T>(recados: T[], ordem: 'asc' | 'desc'): T[] {
  return ordem === 'desc'
    ? recados.slice(0, RECADO_LIMITE)
    : recados.slice(-RECADO_LIMITE);
}
