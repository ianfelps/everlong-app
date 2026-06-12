const MS_DIA = 86_400_000;
const MS_HORA = 3_600_000;
const MS_MINUTO = 60_000;

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
