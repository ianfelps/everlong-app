'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { UploadModal } from './UploadModal';
import { Lightbox } from './Lightbox';
import { RandomPhotoButton } from './RandomPhotoButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { mesAno } from '@/lib/format';
import type { FotoItem } from './types';

const POEMA_ALBUM = 'guardar a luz de um dia comum para voltar nela depois';
const MASONRY_ROW = 8;

function AlbumPhotoCard({
  foto,
  onOpen,
}: {
  foto: FotoItem;
  onOpen: (foto: FotoItem) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [span, setSpan] = useState(32);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const medir = () => {
      const grid = el.parentElement;
      const styles = grid ? window.getComputedStyle(grid) : null;
      const rowGap = styles ? parseFloat(styles.rowGap || '0') : 0;
      const cssRowHeight = styles ? parseFloat(styles.gridAutoRows || '') : Number.NaN;
      const rowHeight = Number.isFinite(cssRowHeight) ? cssRowHeight : MASONRY_ROW;
      const height = el.offsetHeight;
      const next = Math.ceil((height + rowGap) / (rowHeight + rowGap));
      setSpan(Math.max(1, next));
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [foto.id]);

  return (
    <div
      ref={ref}
      className="photo-card card-metal-edge pop-in"
      style={{ gridRowEnd: `span ${span}` }}
      onClick={() => onOpen(foto)}
    >
      <img
        src={`/api/fotos/${foto.id}/binario`}
        alt={foto.legenda ?? 'foto do álbum'}
        className="album-photo"
      />
      <div className="photo-meta">
        <div className="photo-cap">{foto.legenda ?? 'Uma lembrança nossa.'}</div>
        <div className="photo-date">{mesAno(foto.tiradaEm ?? foto.uploadedAt)}</div>
      </div>
    </div>
  );
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
          Um lugar para as fotos que ainda dizem alguma coisa quando a gente olha de novo.{' '}
          {fotos.length} lembranças por aqui.
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
        <div className="album-actions">
          <RandomPhotoButton fotos={filtradas} />
          <button className="btn btn-primary" onClick={() => setUpload(true)}>
            <Plus size={16} /> Adicionar foto
          </button>
        </div>
      </div>

      {fotos.length === 0 ? (
        <EmptyState
          line={POEMA_ALBUM}
          title="Ainda não tem foto aqui"
          cta="Adicionar a primeira foto"
          onCta={() => setUpload(true)}
        />
      ) : (
        <div className="masonry">
          {filtradas.map((f) => (
            <AlbumPhotoCard key={f.id} foto={f} onOpen={setLightbox} />
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
