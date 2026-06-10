export type CorRecado = {
  nome: string;
  hex: string;
};

export const CORES_RECADO: CorRecado[] = [
  { nome: 'vermelho', hex: '#F0353B' },
  { nome: 'amarelo', hex: '#FFD23F' },
  { nome: 'ciano', hex: '#3FD0C9' },
  { nome: 'rosa', hex: '#FF7AC6' },
  { nome: 'verde', hex: '#8BE04E' },
];

const HEX_POR_NOME = new Map(CORES_RECADO.map((c) => [c.nome, c.hex]));

export function hexDaCor(nome: string | null | undefined): string {
  if (!nome) return '#FFD23F';
  return HEX_POR_NOME.get(nome) ?? nome;
}
