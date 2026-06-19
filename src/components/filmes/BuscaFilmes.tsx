'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Plus, Check, X } from 'lucide-react';
import { apiGet, apiJson, ApiClientError } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { posterUrl } from '@/lib/filmes';
import { PreviewModal } from './PreviewModal';
import type { ResultadoTmdb } from './types';

export function BuscaFilmes({
  existentes,
  onAdded,
}: {
  existentes: Set<number>;
  onAdded: () => void;
}) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ResultadoTmdb[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [adicionando, setAdicionando] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const [preview, setPreview] = useState<ResultadoTmdb | null>(null);

  const q = termo.trim();
  const modoPopulares = q.length < 2;

  useEffect(() => {
    if (!aberto) return;
    const url = modoPopulares
      ? '/api/filmes/buscar'
      : `/api/filmes/buscar?q=${encodeURIComponent(q)}`;
    setBuscando(true);
    const t = setTimeout(
      async () => {
        try {
          const rows = await apiGet<ResultadoTmdb[]>(url);
          setResultados(rows);
          setErro(null);
        } catch (e) {
          setErro(e instanceof ApiClientError ? e.message : 'falha na busca');
          setResultados([]);
        } finally {
          setBuscando(false);
        }
      },
      modoPopulares ? 0 : 380,
    );
    return () => clearTimeout(t);
  }, [termo, aberto, modoPopulares, q]);

  const inputRef = useRef<HTMLInputElement>(null);

  function fechar() {
    setAberto(false);
    setTermo('');
    setResultados([]);
    setErro(null);
  }

  async function adicionar(tmdbId: number) {
    if (adicionando != null) return;
    setAdicionando(tmdbId);
    setErro(null);
    try {
      await apiJson('/api/filmes', 'POST', { tmdb_id: tmdbId });
      onAdded();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao adicionar');
    } finally {
      setAdicionando(null);
    }
  }

  return (
    <div className="filme-busca">
      <div className="search filme-search">
        <Search size={16} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar filme para adicionar…"
          value={termo}
          onFocus={() => setAberto(true)}
          onChange={(e) => setTermo(e.target.value)}
        />
        {buscando && <LoadingSpinner size={15} />}
        {aberto && (
          <button
            type="button"
            className="filme-busca-x"
            onClick={fechar}
            title="Fechar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {aberto && (
        <div className="filme-busca-painel card">
          {erro && <div className="login-error">{erro}</div>}
          {modoPopulares && !erro && (
            <p className="filme-secao-label mono">Populares no momento</p>
          )}

          <div className="filme-busca-grid">
            {resultados.map((r) => {
              const thumb = posterUrl(r.posterPath, 'w185');
              const jaTem = existentes.has(r.tmdbId);
              return (
                <button
                  type="button"
                  className="filme-busca-item"
                  key={r.tmdbId}
                  onClick={() => setPreview(r)}
                  title="Ver detalhes"
                >
                  <div className="filme-busca-thumb">
                    {thumb ? (
                      <ProgressiveImage
                        src={thumb}
                        alt={r.titulo}
                        mode="fill"
                        fit="cover"
                      />
                    ) : (
                      <div className="ph" />
                    )}
                    <span
                      role="button"
                      tabIndex={jaTem ? -1 : 0}
                      className={`filme-busca-add ${jaTem ? 'is-in' : ''}`}
                      aria-busy={adicionando === r.tmdbId}
                      aria-disabled={jaTem || adicionando != null}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!jaTem) adicionar(r.tmdbId);
                      }}
                      title={jaTem ? 'Já no catálogo' : 'Adicionar ao catálogo'}
                    >
                      {jaTem ? <Check size={15} /> : <Plus size={15} />}
                    </span>
                  </div>
                  <span className="filme-busca-titulo">{r.titulo}</span>
                  <span className="filme-busca-ano">{r.ano ?? '—'}</span>
                </button>
              );
            })}
            {!buscando && !modoPopulares && resultados.length === 0 && !erro && (
              <p className="filme-vazio mono">nenhum resultado</p>
            )}
          </div>
        </div>
      )}

      {preview && (
        <PreviewModal
          filme={preview}
          jaTem={existentes.has(preview.tmdbId)}
          onClose={() => setPreview(null)}
          onAdded={onAdded}
        />
      )}
    </div>
  );
}
