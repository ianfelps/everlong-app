import { describe, expect, it } from 'vitest';
import { mediaEstrelas, posterUrl } from './filmes';

describe('posterUrl', () => {
  it('monta URL TMDB com tamanho padrão', () => {
    expect(posterUrl('/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/abc.jpg',
    );
  });

  it('aceita tamanho custom', () => {
    expect(posterUrl('/abc.jpg', 'w185')).toBe(
      'https://image.tmdb.org/t/p/w185/abc.jpg',
    );
  });

  it('retorna null sem path', () => {
    expect(posterUrl(null)).toBeNull();
    expect(posterUrl(undefined)).toBeNull();
  });
});

describe('mediaEstrelas', () => {
  it('média vazia = 0', () => {
    expect(mediaEstrelas([])).toBe(0);
  });

  it('arredonda para 1 casa', () => {
    expect(mediaEstrelas([5, 4])).toBe(4.5);
    expect(mediaEstrelas([5, 4, 4])).toBe(4.3);
  });
});
