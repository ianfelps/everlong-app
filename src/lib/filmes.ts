const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'original';

export function posterUrl(
  path: string | null | undefined,
  size: PosterSize = 'w500',
): string | null {
  if (!path) return null;
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

export function mediaEstrelas(notas: number[]): number {
  if (notas.length === 0) return 0;
  const soma = notas.reduce((acc, n) => acc + n, 0);
  return Math.round((soma / notas.length) * 10) / 10;
}
