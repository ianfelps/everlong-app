'use client';

import { Lock, Unlock, Check } from 'lucide-react';
import { MolecularField } from '@/components/brand/MolecularField';
import { dataExtenso, diasAte } from '@/lib/format';
import type { CapItem } from './types';

export function CapCard({
  cap,
  onOpen,
}: {
  cap: CapItem;
  onOpen: (cap: CapItem) => void;
}) {
  const locked = new Date(cap.dataDesbloqueio) > new Date();

  if (locked) {
    const d = diasAte(cap.dataDesbloqueio);
    return (
      <div className="cap-card cap-locked card-metal-edge">
        <MolecularField opacity={0.06} className="mol-mark" />
        <div className="cap-lockwrap">
          <div className="cap-padlock">
            <Lock size={22} />
          </div>
          <span className="cap-from">de {cap.from}</span>
        </div>
        <div className="cap-title">{cap.titulo}</div>
        <div className="cap-count">
          desbloqueia em <b>{d}</b> {d === 1 ? 'dia' : 'dias'}
        </div>
        <div
          className="mono"
          style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 6, letterSpacing: '.08em' }}
        >
          {dataExtenso(cap.dataDesbloqueio)}
        </div>
      </div>
    );
  }

  return (
    <div className="cap-card cap-open card-metal-edge" onClick={() => onOpen(cap)}>
      <div className="cap-lockwrap">
        <div
          className="cap-padlock"
          style={{ background: 'linear-gradient(180deg,#F0353B,#A81B22)', color: '#fff' }}
        >
          <Unlock size={22} />
        </div>
        <span className="cap-from">de {cap.from}</span>
      </div>
      <div className="cap-title">{cap.titulo}</div>
      <div className="cap-badge">
        <Check size={13} color="#8BE04E" /> desbloqueada · toque para ler
      </div>
    </div>
  );
}
