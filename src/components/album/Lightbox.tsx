'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Download, Pencil, Trash2, X } from 'lucide-react';
import { ApiClientError, apiJson } from '@/lib/api';
import { mesAno } from '@/lib/format';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    setMontado(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const data = foto.tiradaEm ?? foto.uploadedAt;

  async function salvar() {
    setBusy(true);
    setErro(null);
    try {
      await apiJson(`/api/fotos/${foto.id}`, 'PATCH', {
        legenda: legenda.trim() || null,
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
        <button
          className="modal-x"
          onClick={onClose}
          disabled={busy}
          style={{ position: 'absolute', top: 18, right: 18, color: '#fff', zIndex: 2 }}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="lb-stage">
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

        <div className="lb-cap" style={{ width: 'min(560px,92vw)' }}>
          {editando ? (
            <div className="field" style={{ marginTop: 0, textAlign: 'left' }}>
              <textarea
                rows={2}
                value={legenda}
                placeholder="Escreva uma lembrança…"
                onChange={(event) => setLegenda(event.target.value)}
                disabled={busy}
              />
            </div>
          ) : (
            <>
              <div className="photo-cap">{legenda.trim() ? legenda : 'Sem legenda.'}</div>
              <div className="photo-date">{mesAno(data)}</div>
            </>
          )}

          {erro && <div className="login-error">{erro}</div>}

          <div className="lb-actions">
            {editando ? (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditando(false)}
                  disabled={busy}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary btn-sm" onClick={salvar} disabled={busy}>
                  {busy ? <LoadingSpinner label="Salvando" /> : <Check size={15} />}
                  {busy ? 'Salvando…' : 'Salvar'}
                </button>
              </>
            ) : confirmar ? (
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
                <button className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
                  <Pencil size={15} /> Editar legenda
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmar(true)}>
                  <Trash2 size={15} /> Excluir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
