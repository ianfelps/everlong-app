'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import { apiGet, ApiClientError } from '@/lib/api';
import { Lightbox } from './Lightbox';
import type { FotoItem } from './types';

export function RandomPhotoButton({
  fotos,
  className = 'btn btn-ghost',
}: {
  fotos?: FotoItem[];
  className?: string;
}) {
  const router = useRouter();
  const [foto, setFoto] = useState<FotoItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [semFotos, setSemFotos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function sortear() {
    setErro(null);

    if (fotos) {
      if (fotos.length === 0) return;
      setFoto(fotos[Math.floor(Math.random() * fotos.length)] ?? null);
      return;
    }

    setBusy(true);
    try {
      const sorteada = await apiGet<FotoItem | null>('/api/fotos/aleatoria');
      setSemFotos(!sorteada);
      setFoto(sorteada);
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao sortear');
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || semFotos || fotos?.length === 0;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={sortear}
        disabled={disabled}
      >
        <Shuffle size={16} /> {busy ? 'Sorteando...' : 'Foto aleatória'}
      </button>
      {erro && (
        <span className="mono" style={{ fontSize: 12, color: 'var(--red)' }}>
          {erro}
        </span>
      )}
      {foto && (
        <Lightbox
          foto={foto}
          onClose={() => setFoto(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </>
  );
}
