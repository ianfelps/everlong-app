'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Heart } from 'lucide-react';
import { PhotoImage } from './PhotoImage';
import { UploadModal } from './UploadModal';
import { Lightbox } from './Lightbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { mesAno } from '@/lib/format';
import type { FotoItem } from './types';

const POEMA_ALBUM = 'guardar a luz de um dia comum até ele virar lembrança';
const ALTURAS = [240, 300, 200, 340, 260, 290];

function alturaCard(f: FotoItem, i: number): number {
  if (f.largura && f.altura && f.largura > 0) {
    const h = Math.round((260 * f.altura) / f.largura);
    return Math.min(420, Math.max(180, h));
  }
  return ALTURAS[i % ALTURAS.length]!;
}

export function AlbumGrid({ fotos }: { fotos: FotoItem[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [upload, setUpload] = useState(false);
  const [lightbox, setLightbox] = useState<FotoItem | null>(null);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return fotos;
    return fotos.filter(
      (f) =>
        (f.legenda ?? '').toLowerCase().includes(q) ||
        mesAno(f.tiradaEm ?? f.uploadedAt).toLowerCase().includes(q),
    );
  }, [fotos, busca]);

  return (
    <div className="page shell fade-in">
      <div className="page-head">
        <h1 className="page-title">Nosso álbum</h1>
        <p className="page-sub">
          Cada quadro é um dia que a gente não quer esquecer. {fotos.length} memórias guardadas.
        </p>
      </div>

      <div className="album-bar">
        <div className="search">
          <Search size={17} />
          <input
            placeholder="Buscar por legenda, data, lugar…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setUpload(true)}>
          <Plus size={16} /> Adicionar foto
        </button>
      </div>

      {fotos.length === 0 ? (
        <EmptyState
          line={POEMA_ALBUM}
          title="O álbum ainda está em branco"
          cta="Adicionar a primeira foto"
          onCta={() => setUpload(true)}
        />
      ) : (
        <div className="masonry">
          {filtradas.map((f, i) => (
            <div key={f.id} className="photo-card pop-in" onClick={() => setLightbox(f)}>
              <button className="like" onClick={(e) => e.stopPropagation()}>
                <Heart size={15} color="var(--red)" />
              </button>
              <PhotoImage id={f.id} legenda={f.legenda} style={{ height: alturaCard(f, i) }} />
              <div className="photo-meta">
                <div className="photo-cap">{f.legenda ?? 'Uma lembrança nossa.'}</div>
                <div className="photo-date">{mesAno(f.tiradaEm ?? f.uploadedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {upload && (
        <UploadModal onClose={() => setUpload(false)} onUploaded={() => router.refresh()} />
      )}
      {lightbox && (
        <Lightbox
          foto={lightbox}
          onClose={() => setLightbox(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}
