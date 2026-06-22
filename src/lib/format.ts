const MS_DIA = 86_400_000;
const MS_HORA = 3_600_000;
const MS_MINUTO = 60_000;

/**
 * Converte um valor de data para o formato 'YYYY-MM-DD' usado por <input type="date">,
 * respeitando o fuso local (evita deslocar o dia por causa de UTC).
 */
export function dataParaInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Converte um 'YYYY-MM-DD' vindo de <input type="date"> para ISO, fixando o meio-dia
 * local. Isso garante que o dia escolhido não mude ao serializar para UTC.
 */
export function inputParaIso(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const [ano, mes, dia] = v.split('-').map(Number);
  if (!ano || !mes || !dia) return null;
  const d = new Date(ano, mes - 1, dia, 12, 0, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function mesAno(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '');
}

export function dataExtenso(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function dataCurta(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace('.', '');
}

export function tempoAte(
  date: Date | string,
  agora: Date = new Date(),
): { valor: number; unidade: string } {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.max(0, d.getTime() - agora.getTime());

  if (diff >= MS_DIA) {
    const valor = Math.ceil(diff / MS_DIA);
    return { valor, unidade: valor === 1 ? 'dia' : 'dias' };
  }

  if (diff >= MS_HORA) {
    const valor = Math.ceil(diff / MS_HORA);
    return { valor, unidade: valor === 1 ? 'hora' : 'horas' };
  }

  const valor = Math.ceil(diff / MS_MINUTO);
  return { valor, unidade: valor === 1 ? 'minuto' : 'minutos' };
}

export function tempoRelativo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return 'ontem';
  return `${dias} dias`;
}
