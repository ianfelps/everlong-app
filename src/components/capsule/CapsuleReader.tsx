'use client';

import { useState } from 'react';
import { Trash2, Unlock, X } from 'lucide-react';
import { ApiClientError, apiJson } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import type { CapAberta } from './types';

export function CapsuleReader({
  cap,
  carregando,
  onClose,
  onDeleted,
}: {
  cap: CapAberta | null;
  carregando: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir() {
    if (!cap) return;
    setExcluindo(true);
    setErro(null);
    try {
      await apiJson(`/api/capsulas/${cap.id}`, 'DELETE');
      onDeleted();
    } catch (error) {
      setErro(
        error instanceof ApiClientError ? error.message : 'falha ao excluir a cápsula',
      );
      setExcluindo(false);
    }
  }

  return (
    <ModalPortal onClose={excluindo ? () => undefined : onClose}>
      <div
        className="modal card pop-in"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: 520 }}
        aria-busy={carregando || excluindo}
      >
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="cap-padlock"
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: 'linear-gradient(180deg,#F0353B,#A81B22)',
                color: '#fff',
              }}
            >
              <Unlock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16 }}>{cap?.titulo ?? 'Abrindo…'}</h3>
              {cap && <span className="cap-from">de {cap.from}</span>}
            </div>
          </div>
          <button
            className="modal-x"
            onClick={onClose}
            disabled={carregando || excluindo}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {carregando || !cap ? (
            <div className="inline-loading" role="status">
              <LoadingSpinner label="Abrindo cápsula" />
              <span className="mono">abrindo a cápsula…</span>
            </div>
          ) : (
            <>
              <p
                className="serif-note"
                style={{
                  fontSize: 24,
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {cap.conteudo}
              </p>
              {cap.fotos && cap.fotos.length > 0 && (
                <div className="capsule-photo-grid">
                  {cap.fotos.map((foto) => (
                    <ProgressiveImage
                      key={foto.id}
                      className="capsule-photo"
                      src={`/api/capsulas/${cap.id}/fotos/${foto.id}/binario`}
                      alt={foto.legenda ?? 'foto da cápsula'}
                      fallbackLabel="foto indisponível"
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {erro && <div className="login-error">{erro}</div>}
        </div>
        {cap && !carregando && (
          <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
            {confirmar ? (
              <>
                <span
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: 'var(--ink-dim)',
                    alignSelf: 'center',
                  }}
                >
                  Excluir esta cápsula para sempre?
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setConfirmar(false)}
                    disabled={excluindo}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={excluir}
                    disabled={excluindo}
                  >
                    {excluindo ? (
                      <LoadingSpinner label="Excluindo cápsula" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                    {excluindo ? 'Excluindo…' : 'Confirmar exclusão'}
                  </button>
                </div>
              </>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmar(true)}
              >
                <Trash2 size={15} /> Excluir cápsula
              </button>
            )}
          </div>
        )}
      </div>
    </ModalPortal>
  );
}
