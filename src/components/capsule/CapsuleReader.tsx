'use client';

import { Unlock, X } from 'lucide-react';
import type { CapAberta } from './types';

export function CapsuleReader({
  cap,
  carregando,
  onClose,
}: {
  cap: CapAberta | null;
  carregando: boolean;
  onClose: () => void;
}) {
  return (
    <div className="modal-veil" onClick={onClose}>
      <div
        className="modal card pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}
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
          <button className="modal-x" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {carregando || !cap ? (
            <p className="mono" style={{ color: 'var(--ink-faint)' }}>
              abrindo a cápsula…
            </p>
          ) : (
            <p
              className="serif-note"
              style={{ fontSize: 24, color: 'var(--ink)', lineHeight: 1.5, margin: 0 }}
            >
              {cap.conteudo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
