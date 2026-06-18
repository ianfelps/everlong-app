'use client';

import { Heart, Users, Bookmark } from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { StarRating } from '@/components/ui/StarRating';
import { mediaEstrelas, posterUrl } from '@/lib/filmes';
import type { FilmeResumo } from './types';

export function FilmeCard({
  filme,
  meuId,
  onOpen,
}: {
  filme: FilmeResumo;
  meuId: string;
  onOpen: () => void;
}) {
  const poster = posterUrl(filme.posterPath, 'w342');
  const media = mediaEstrelas(filme.avaliacoes.map((a) => a.nota));
  const assistido = filme.assistidoJunto != null;

  return (
    <button type="button" className="filme-card" onClick={onOpen}>
      <div className="filme-poster">
        {poster ? (
          <ProgressiveImage src={poster} alt={filme.titulo} mode="fill" fit="cover" />
        ) : (
          <div className="ph filme-poster-ph">
            <span className="ph-label">{filme.titulo}</span>
          </div>
        )}
        {assistido ? (
          <span className="filme-badge-assistido" title="Assistido juntos">
            <Users size={12} /> juntos
          </span>
        ) : filme.naWatchlist ? (
          <span className="filme-badge-watchlist" title="Assistir depois">
            <Bookmark size={12} fill="currentColor" /> depois
          </span>
        ) : null}
        {filme.favoritos.length > 0 && (
          <span className="filme-hearts">
            {filme.favoritos.map((fav) => (
              <Heart
                key={fav.autorId}
                size={14}
                fill="currentColor"
                className={fav.autorId === meuId ? 'heart-eu' : 'heart-par'}
              />
            ))}
          </span>
        )}
      </div>
      <div className="filme-meta">
        <span className="filme-titulo">{filme.titulo}</span>
        <span className="filme-ano">{filme.ano ?? '—'}</span>
        <span className="filme-stars">
          {filme.avaliacoes.length > 0 ? (
            <>
              <StarRating value={Math.round(media)} size={14} />
              <span className="filme-media">{media.toFixed(1)}</span>
            </>
          ) : (
            <span className="filme-sem-nota">sem avaliação</span>
          )}
        </span>
      </div>
    </button>
  );
}
