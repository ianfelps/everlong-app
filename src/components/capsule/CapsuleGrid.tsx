'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { CapCard } from './CapCard';
import { CapsuleReader } from './CapsuleReader';
import { SealModal } from './SealModal';
import { apiGet, ApiClientError } from '@/lib/api';
import type { CapItem, CapAberta } from './types';

type RowCapsula = {
  id: string;
  titulo: string;
  conteudo: string;
  fotos?: CapAberta['fotos'];
};

export function CapsuleGrid({ caps }: { caps: CapItem[] }) {
  const router = useRouter();
  const [reader, setReader] = useState<CapAberta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [seal, setSeal] = useState(false);

  async function abrir(cap: CapItem) {
    setAberta(true);
    setReader(null);
    setCarregando(true);
    try {
      const row = await apiGet<RowCapsula>(`/api/capsulas/${cap.id}`);
      setReader({
        id: row.id,
        titulo: row.titulo,
        conteudo: row.conteudo,
        from: cap.from,
        fotos: row.fotos ?? [],
      });
    } catch (e) {
      if (!(e instanceof ApiClientError)) throw e;
      setAberta(false);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div className="capsule-grid">
        {caps.map((c) => (
          <CapCard key={c.id} cap={c} onOpen={abrir} />
        ))}
        <button
          className="cap-card"
          onClick={() => setSeal(true)}
          style={{
            border: '2px dashed var(--hairline-strong)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            background: 'rgba(255,255,255,.02)',
          }}
        >
          <div style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
            <div className="dz-icon" style={{ margin: '0 auto 12px' }}>
              <Plus size={22} />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--ink-dim)' }}>Selar nova mensagem</div>
            <div className="mono" style={{ fontSize: 11, marginTop: 6 }}>
              escolha a data de abertura
            </div>
          </div>
        </button>
      </div>

      {aberta && (
        <CapsuleReader
          cap={reader}
          carregando={carregando}
          onClose={() => setAberta(false)}
        />
      )}
      {seal && (
        <SealModal onClose={() => setSeal(false)} onSealed={() => router.refresh()} />
      )}
    </>
  );
}
