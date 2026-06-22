'use client';

import { useEffect, useState } from 'react';
import { X, Heart, Users, Trash2, Bookmark, Pencil } from 'lucide-react';
import { apiGet, apiJson, ApiClientError } from '@/lib/api';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { StarRating } from '@/components/ui/StarRating';
import { renderInlineMarkdown } from '@/lib/inline-markdown';
import { dataExtenso } from '@/lib/format';
import { posterUrl } from '@/lib/filmes';
import type { FilmeResumo, ResultadoTmdb } from './types';

export function FilmeDetailModal({
  filme,
  meuId,
  perfis,
  onClose,
  onChanged,
}: {
  filme: FilmeResumo;
  meuId: string;
  perfis: Record<string, string>;
  onClose: () => void;
  onChanged: () => void;
}) {
  const minhaAval = filme.avaliacoes.find((a) => a.autorId === meuId);
  const souFavorito = filme.favoritos.some((f) => f.autorId === meuId);
  const assistido = filme.assistidoJunto != null;
  const naWatchlist = filme.naWatchlist;

  const dataIso = filme.assistidoJunto?.dataAssistido;
  const [nota, setNota] = useState(minhaAval?.nota ?? 0);
  const [texto, setTexto] = useState(minhaAval?.texto ?? '');
  const [editando, setEditando] = useState(false);
  const [quando, setQuando] = useState(dataIso ? dataIso.slice(0, 10) : '');
  const [marcando, setMarcando] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<ResultadoTmdb | null>(null);

  const poster = posterUrl(filme.posterPath, 'w342');

  // infos extras (elenco, direção, gêneros…) ao vivo do TMDB; best-effort
  useEffect(() => {
    let vivo = true;
    apiGet<ResultadoTmdb>(`/api/filmes/tmdb/${filme.tmdbId}`)
      .then((d) => {
        if (vivo) setDetalhe(d);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [filme.tmdbId]);

  async function acao(
    fn: () => Promise<unknown>,
    opts: { fechar?: boolean; onSuccess?: () => void } = {},
  ) {
    if (busy) return;
    setBusy(true);
    setErro(null);
    try {
      await fn();
      onChanged();
      opts.onSuccess?.();
      if (opts.fechar) onClose();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha na operação');
    } finally {
      setBusy(false);
    }
  }

  function salvarAvaliacao() {
    if (nota < 1) {
      setErro('dê ao menos 1 estrela');
      return;
    }
    acao(
      () =>
        apiJson(`/api/filmes/${filme.id}/avaliacoes`, 'PUT', {
          nota,
          texto: texto.trim() || null,
        }),
      { onSuccess: () => setEditando(false) },
    );
  }

  function removerAvaliacao() {
    acao(async () => {
      await apiJson(`/api/filmes/${filme.id}/avaliacoes`, 'DELETE');
      setNota(0);
      setTexto('');
      setEditando(false);
    });
  }

  function cancelarEdicao() {
    setNota(minhaAval?.nota ?? 0);
    setTexto(minhaAval?.texto ?? '');
    setErro(null);
    setEditando(false);
  }

  function toggleFavorito() {
    acao(() =>
      apiJson(`/api/filmes/${filme.id}/favorito`, souFavorito ? 'DELETE' : 'PUT'),
    );
  }

  function toggleWatchlist() {
    acao(() =>
      apiJson(`/api/filmes/${filme.id}/watchlist`, naWatchlist ? 'DELETE' : 'PUT'),
    );
  }

  // date input "YYYY-MM-DD" → ISO ao meio-dia local (evita virar dia anterior no fuso)
  function dataParaIso(d: string): string | null {
    return d ? new Date(`${d}T12:00:00`).toISOString() : null;
  }

  function hoje(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function iniciarMarcacao() {
    setErro(null);
    if (!quando) setQuando(hoje());
    setMarcando(true);
  }

  function confirmarAssistido() {
    acao(async () => {
      await apiJson('/api/assistidos-juntos', 'POST', {
        filme_id: filme.id,
        data_assistido: dataParaIso(quando),
      });
      setMarcando(false);
    });
  }

  function desmarcarAssistido() {
    acao(async () => {
      await apiJson(`/api/assistidos-juntos/${filme.id}`, 'DELETE');
      setQuando('');
      setMarcando(false);
    });
  }

  function excluirFilme() {
    if (!confirm('Remover este filme do catálogo? Avaliações serão apagadas.')) return;
    acao(() => apiJson(`/api/filmes/${filme.id}`, 'DELETE'), { fechar: true });
  }

  const parceiros = Object.entries(perfis).filter(([id]) => id !== meuId);

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
            {filme.ano ? <span className="filme-modal-ano"> ({filme.ano})</span> : null}
          </h3>
          <button className="modal-x" onClick={onClose} disabled={busy}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="filme-detalhe-top">
            <div className="filme-detalhe-poster">
              {poster ? (
                <ProgressiveImage src={poster} alt={filme.titulo} mode="fill" fit="cover" />
              ) : (
                <div className="ph filme-poster-ph">
                  <span className="ph-label">{filme.titulo}</span>
                </div>
              )}
            </div>
            <div className="filme-detalhe-info">
              {filme.sinopse ? (
                <p className="filme-sinopse">{filme.sinopse}</p>
              ) : (
                <p className="filme-sinopse filme-sem-nota">Sem sinopse.</p>
              )}

              {detalhe && (
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
                  {detalhe.produtoras && detalhe.produtoras.length > 0 && (
                    <p className="filme-info-linha">
                      <span className="filme-info-label">Produtora</span>
                      {detalhe.produtoras.join(', ')}
                    </p>
                  )}
                </div>
              )}

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
                  onClick={
                    assistido
                      ? desmarcarAssistido
                      : marcando
                        ? () => setMarcando(false)
                        : iniciarMarcacao
                  }
                  disabled={busy}
                >
                  <Users size={15} />
                  {assistido
                    ? 'Assistido juntos'
                    : marcando
                      ? 'Cancelar'
                      : 'Marcar assistido'}
                </button>
              </div>

              {marcando && !assistido && (
                <div className="field filme-quando">
                  <label>Quando assistiram?</label>
                  <div className="filme-quando-row">
                    <input
                      type="date"
                      value={quando}
                      max={hoje()}
                      onChange={(e) => setQuando(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={confirmarAssistido}
                      disabled={busy}
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}

              {assistido && (
                <p className="filme-assistido-data mono">
                  {filme.assistidoJunto?.dataAssistido
                    ? `Assistido em ${dataExtenso(filme.assistidoJunto.dataAssistido)}`
                    : 'Marcado como assistido juntos'}
                </p>
              )}
            </div>
          </div>

          <div className="divider filme-div" />

          <h4 className="filme-sec-titulo">Avaliações</h4>
          <div className="filme-avals">
            {/* minha avaliação */}
            <div className="filme-aval filme-aval-eu">
              <div className="filme-aval-head">
                <span className="filme-aval-nome">Você</span>
                {editando ? (
                  <StarRating value={nota} onChange={setNota} size={22} />
                ) : minhaAval ? (
                  <StarRating value={minhaAval.nota} size={20} />
                ) : (
                  <span className="filme-sem-nota">ainda não avaliou</span>
                )}
              </div>

              {editando ? (
                <>
                  <textarea
                    className="filme-editor-texto"
                    rows={3}
                    placeholder="O que achou? (aceita *itálico* e **negrito**)"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                  />
                  <div className="filme-editor-acoes">
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={cancelarEdicao}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={salvarAvaliacao}
                      disabled={busy}
                    >
                      {minhaAval ? 'Atualizar' : 'Salvar'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {minhaAval?.texto && (
                    <p className="filme-aval-texto">
                      {renderInlineMarkdown(minhaAval.texto, 'aval-eu')}
                    </p>
                  )}
                  <div className="filme-editor-acoes">
                    {minhaAval && (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={removerAvaliacao}
                        disabled={busy}
                      >
                        Remover
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => setEditando(true)}
                      disabled={busy}
                    >
                      <Pencil size={14} /> {minhaAval ? 'Editar' : 'Avaliar'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* avaliação do parceiro — somente leitura */}
            {parceiros.map(([id, nome]) => {
              const aval = filme.avaliacoes.find((a) => a.autorId === id);
              return (
                <div className="filme-aval" key={id}>
                  <div className="filme-aval-head">
                    <span className="filme-aval-nome">{nome}</span>
                    {aval ? (
                      <StarRating value={aval.nota} size={18} />
                    ) : (
                      <span className="filme-sem-nota">ainda não avaliou</span>
                    )}
                  </div>
                  {aval?.texto && (
                    <p className="filme-aval-texto">
                      {renderInlineMarkdown(aval.texto, `aval-${id}`)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {erro && <div className="login-error">{erro}</div>}
        </div>

        <div className="modal-foot filme-modal-foot">
          <button
            type="button"
            className="btn btn-sm btn-ghost filme-excluir"
            onClick={excluirFilme}
            disabled={busy}
          >
            <Trash2 size={15} /> Excluir do catálogo
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
