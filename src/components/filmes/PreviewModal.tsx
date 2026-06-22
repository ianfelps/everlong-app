'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Check, Heart, Users, Bookmark } from 'lucide-react';
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
  const [detalhe, setDetalhe] = useState<ResultadoTmdb>(filme);
  const [carregando, setCarregando] = useState(true);
  // id no catálogo, setado após adicionar (ou já presente)
  const [filmeId, setFilmeId] = useState<string | null>(null);
  const [souFavorito, setSouFavorito] = useState(false);
  const [naWatchlist, setNaWatchlist] = useState(false);
  const [assistido, setAssistido] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const noCatalogo = jaTem || filmeId != null;

  useEffect(() => {
    let vivo = true;
    apiGet<ResultadoTmdb>(`/api/filmes/tmdb/${filme.tmdbId}`)
      .then((d) => {
        if (vivo) setDetalhe(d);
      })
      .catch(() => {})
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, [filme.tmdbId]);

  // garante filme no catálogo; retorna o id ou null em caso de erro
  async function garantirCatalogo(): Promise<string | null> {
    if (filmeId) return filmeId;
    const row = await apiJson<{ id: string }>('/api/filmes', 'POST', {
      tmdb_id: filme.tmdbId,
    });
    if (!row) throw new Error('falha ao adicionar');
    setFilmeId(row.id);
    onAdded();
    return row.id;
  }

  async function adicionar() {
    if (busy || noCatalogo) return;
    setBusy(true);
    setErro(null);
    try {
      await garantirCatalogo();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao adicionar');
    } finally {
      setBusy(false);
    }
  }

  // adiciona ao catálogo (se preciso) e aplica a ação na lista
  async function comFilme(fn: (id: string) => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setErro(null);
    try {
      const id = await garantirCatalogo();
      if (!id) return;
      await fn(id);
      onAdded();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha na operação');
    } finally {
      setBusy(false);
    }
  }

  function toggleFavorito() {
    comFilme(async (id) => {
      await apiJson(`/api/filmes/${id}/favorito`, souFavorito ? 'DELETE' : 'PUT');
      setSouFavorito((v) => !v);
    });
  }

  function toggleWatchlist() {
    comFilme(async (id) => {
      await apiJson(`/api/filmes/${id}/watchlist`, naWatchlist ? 'DELETE' : 'PUT');
      setNaWatchlist((v) => !v);
    });
  }

  function hoje(): string {
    const d = new Date();
    return new Date(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T12:00:00`,
    ).toISOString();
  }

  function toggleAssistido() {
    comFilme(async (id) => {
      if (assistido) {
        await apiJson(`/api/assistidos-juntos/${id}`, 'DELETE');
        setAssistido(false);
      } else {
        await apiJson('/api/assistidos-juntos', 'POST', {
          filme_id: id,
          data_assistido: hoje(),
        });
        setAssistido(true);
      }
    });
  }

  const poster = posterUrl(filme.posterPath, 'w342');

  return (
    <ModalPortal onClose={busy ? () => undefined : onClose}>
      <div
        className="modal card pop-in filme-modal"
        onClick={(e) => e.stopPropagation()}
        aria-busy={busy}
      >
        <div className="modal-head">
          <h3>
            {filme.titulo}
            {filme.ano ? (
              <span className="filme-modal-ano"> ({filme.ano})</span>
            ) : null}
          </h3>
          <button className="modal-x" onClick={onClose} disabled={busy}>
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
              {detalhe.sinopse ? (
                <p className="filme-sinopse">{detalhe.sinopse}</p>
              ) : carregando ? (
                <p className="filme-sinopse filme-sem-nota">
                  <LoadingSpinner size={14} /> Carregando sinopse…
                </p>
              ) : (
                <p className="filme-sinopse filme-sem-nota">Sem sinopse.</p>
              )}

              {detalhe.generos?.length ||
              detalhe.duracaoMin ||
              detalhe.diretor ||
              detalhe.elenco?.length ? (
                <div className="filme-info-extra">
                  {(detalhe.generos?.length || detalhe.duracaoMin) && (
                    <div className="filme-chips">
                      {detalhe.generos?.map((g) => (
                        <span className="filme-chip" key={g}>
                          {g}
                        </span>
                      ))}
                      {detalhe.duracaoMin ? (
                        <span className="filme-chip filme-chip-dur">
                          {Math.floor(detalhe.duracaoMin / 60)}h{' '}
                          {String(detalhe.duracaoMin % 60).padStart(2, '0')}min
                        </span>
                      ) : null}
                    </div>
                  )}
                  {detalhe.diretor && (
                    <p className="filme-info-linha">
                      <span className="filme-info-label">Direção</span>
                      {detalhe.diretor}
                    </p>
                  )}
                  {detalhe.elenco && detalhe.elenco.length > 0 && (
                    <p className="filme-info-linha">
                      <span className="filme-info-label">Elenco</span>
                      {detalhe.elenco.join(', ')}
                    </p>
                  )}
                </div>
              ) : null}

              <div className="filme-acoes">
                <button
                  type="button"
                  className={`btn btn-sm ${souFavorito ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={toggleFavorito}
                  disabled={busy}
                >
                  <Heart size={15} fill={souFavorito ? 'currentColor' : 'none'} />
                  {souFavorito ? 'Favorito' : 'Favoritar'}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${naWatchlist ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={toggleWatchlist}
                  disabled={busy}
                  title="Assistir depois"
                >
                  <Bookmark
                    size={15}
                    fill={naWatchlist ? 'currentColor' : 'none'}
                  />
                  {naWatchlist ? 'Na lista' : 'Assistir depois'}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${assistido ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={toggleAssistido}
                  disabled={busy}
                >
                  <Users size={15} />
                  {assistido ? 'Assistido juntos' : 'Marcar assistido'}
                </button>
              </div>
            </div>
          </div>

          {erro && <div className="login-error">{erro}</div>}
        </div>

        <div className="modal-foot">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            disabled={busy}
          >
            Fechar
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={adicionar}
            disabled={noCatalogo || busy}
            aria-busy={busy}
          >
            {noCatalogo ? (
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
