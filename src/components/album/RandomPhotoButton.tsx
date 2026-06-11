'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import { Lightbox } from './Lightbox';
import type { FotoItem } from './types';

export function RandomPhotoButton({
  fotos,
  className = 'btn btn-ghost',
}: {
  fotos: FotoItem[];
  className?: string;
}) {
  const router = useRouter();
  const [foto, setFoto] = useState<FotoItem | null>(null);

  function sortear() {
    if (fotos.length === 0) return;
    setFoto(fotos[Math.floor(Math.random() * fotos.length)] ?? null);
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={sortear}
        disabled={fotos.length === 0}
      >
        <Shuffle size={16} /> Foto aleatória
      </button>
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
