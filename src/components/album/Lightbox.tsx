'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Download, Pencil, Trash2, X } from 'lucide-react';
import { ApiClientError, apiJson } from '@/lib/api';
import { dataParaInput, inputParaIso, mesAno } from '@/lib/format';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { PhotoImage } from './PhotoImage';
import type { FotoItem } from './types';

export function Lightbox({
  foto,
  onClose,
  onChanged,
}: {
  foto: FotoItem;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [montado, setMontado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [legenda, setLegenda] = useState(foto.legenda ?? '');
  const [dataInput, setDataInput] = useState(dataParaInput(foto.tiradaEm));
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    setMontado(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || busy) return;
      if (editando) setEditando(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, editando, onClose]);

  const data = foto.tiradaEm ?? foto.uploadedAt;

  function abrirEdicao() {
    setLegenda(foto.legenda ?? '');
    setDataInput(dataParaInput(foto.tiradaEm));
    setErro(null);
    setEditando(true);
  }

  function fecharEdicao() {
    if (busy) return;
    setErro(null);
    setEditando(false);
  }

  async function salvar() {
    setBusy(true);
    setErro(null);
    try {
      await apiJson(`/api/fotos/${foto.id}`, 'PATCH', {
        legenda: legenda.trim() || null,
        tirada_em: inputParaIso(dataInput),
      });
      setEditando(false);
      onChanged();
    } catch (error) {
      setErro(error instanceof ApiClientError ? error.message : 'falha ao salvar');
    } finally {
      setBusy(false);
    }
  }

  async function excluir() {
    setBusy(true);
    setErro(null);
    try {
      await apiJson(`/api/fotos/${foto.id}`, 'DELETE');
      onChanged();
      onClose();
    } catch (error) {
      setErro(error instanceof ApiClientError ? error.message : 'falha ao excluir');
      setBusy(false);
    }
  }

  if (!montado) return null;

  return createPortal(
    <div className="lightbox" onClick={busy ? undefined : onClose} aria-busy={busy}>
      <div
        className="lb-inner pop-in"
        onClick={(event) => event.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div className="lb-stage">
          <div className="lb-photo-frame">
            <button
              className="modal-x lb-close"
              onClick={onClose}
              disabled={busy}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            <PhotoImage
              id={foto.id}
              legenda={foto.legenda}
              mode="natural"
              fit="contain"
              priority
              className="lightbox-photo"
              imageStyle={{
                maxWidth: '90vw',
                maxHeight: '74vh',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: 'var(--shadow-pop)',
              }}
            />
          </div>
        </div>

        <div className="lb-cap" style={{ width: 'min(560px,92vw)' }}>
          <div className="photo-cap">{(foto.legenda ?? '').trim() || 'Sem legenda.'}</div>
          <div className="photo-date">{mesAno(data)}</div>

          {!editando && erro && <div className="login-error">{erro}</div>}

          <div className="lb-actions">
            {confirmar ? (
              <>
                <span
                  className="mono"
                  style={{ fontSize: 12, color: 'var(--ink-dim)', alignSelf: 'center' }}
                >
                  Excluir esta foto?
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setConfirmar(false)}
                  disabled={busy}
                >
                  Não
                </button>
                <button className="btn btn-primary btn-sm" onClick={excluir} disabled={busy}>
                  {busy ? <LoadingSpinner label="Excluindo" /> : <Trash2 size={15} />}
                  {busy ? 'Excluindo…' : 'Excluir'}
                </button>
              </>
            ) : (
              <>
                <a
                  className="btn btn-ghost btn-sm"
                  href={`/api/fotos/${foto.id}/binario?download=1`}
                  download
                  aria-label="Baixar foto"
                >
                  <Download size={15} /> Baixar
                </a>
                <button className="btn btn-ghost btn-sm" onClick={abrirEdicao}>
                  <Pencil size={15} /> Editar
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmar(true)}>
                  <Trash2 size={15} /> Excluir
                </button>
              </>
            )}
          </div>
        </div>

        {editando && (
          <ModalPortal onClose={fecharEdicao} className="modal-veil modal-veil-top">
            <div
              className="modal card pop-in"
              onClick={(event) => event.stopPropagation()}
              aria-busy={busy}
            >
              <div className="modal-head">
                <h3>Editar foto</h3>
                <button className="modal-x" onClick={fecharEdicao} disabled={busy}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field">
                  <label>Legenda</label>
                  <textarea
                    rows={2}
                    value={legenda}
                    placeholder="Escreva uma lembrança…"
                    onChange={(event) => setLegenda(event.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="field">
                  <label>Data (quando foi tirada)</label>
                  <input
                    type="date"
                    value={dataInput}
                    onChange={(event) => setDataInput(event.target.value)}
                    disabled={busy}
                  />
                </div>
                {erro && <div className="login-error">{erro}</div>}
              </div>
              <div className="modal-foot">
                <button className="btn btn-ghost" onClick={fecharEdicao} disabled={busy}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={salvar} disabled={busy}>
                  {busy ? <LoadingSpinner label="Salvando" /> : <Check size={16} />}
                  {busy ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </div>,
    document.body,
  );
}
