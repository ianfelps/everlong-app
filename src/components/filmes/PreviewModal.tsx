'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { apiGet, apiJson, ApiClientError } from '@/lib/api';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { posterUrl } from '@/lib/filmes';
import type { ResultadoTmdb } from './types';

export function PreviewModal({
  filme,
  jaTem,
  onClose,
  onAdded,
}: {
  filme: ResultadoTmdb;
  jaTem: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  // sinopse em pt-BR vem do detalhe; lista usa título/capa em inglês
  const [sinopse, setSinopse] = useState<string | null>(filme.sinopse);
  const [carregando, setCarregando] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    apiGet<ResultadoTmdb>(`/api/filmes/tmdb/${filme.tmdbId}`)
      .then((d) => {
        if (vivo) setSinopse(d.sinopse);
      })
      .catch(() => {})
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, [filme.tmdbId]);

  async function adicionar() {
    if (adicionando) return;
    setAdicionando(true);
    setErro(null);
    try {
      await apiJson('/api/filmes', 'POST', { tmdb_id: filme.tmdbId });
      onAdded();
      onClose();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao adicionar');
      setAdicionando(false);
    }
  }

  const poster = posterUrl(filme.posterPath, 'w342');

  return (
    <ModalPortal onClose={adicionando ? () => undefined : onClose}>
      <div
        className="modal card pop-in filme-modal"
        onClick={(e) => e.stopPropagation()}
        aria-busy={adicionando}
      >
        <div className="modal-head">
          <h3>
            {filme.titulo}
            {filme.ano ? (
              <span className="filme-modal-ano"> ({filme.ano})</span>
            ) : null}
          </h3>
          <button className="modal-x" onClick={onClose} disabled={adicionando}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="filme-detalhe-top">
            <div className="filme-detalhe-poster">
              {poster ? (
                <ProgressiveImage
                  src={poster}
                  alt={filme.titulo}
                  mode="fill"
                  fit="cover"
                />
              ) : (
                <div className="ph filme-poster-ph">
                  <span className="ph-label">{filme.titulo}</span>
                </div>
              )}
            </div>
            <div className="filme-detalhe-info">
              {sinopse ? (
                <p className="filme-sinopse">{sinopse}</p>
              ) : carregando ? (
                <p className="filme-sinopse filme-sem-nota">
                  <LoadingSpinner size={14} /> Carregando sinopse…
                </p>
              ) : (
                <p className="filme-sinopse filme-sem-nota">Sem sinopse.</p>
              )}
            </div>
          </div>

          {erro && <div className="login-error">{erro}</div>}
        </div>

        <div className="modal-foot">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            disabled={adicionando}
          >
            Fechar
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={adicionar}
            disabled={jaTem || adicionando}
            aria-busy={adicionando}
          >
            {jaTem ? (
              <>
                <Check size={15} /> No catálogo
              </>
            ) : (
              <>
                <Plus size={15} /> Adicionar ao catálogo
              </>
            )}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
