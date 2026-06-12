'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { mesAno } from '@/lib/format';
import { Lightbox } from './Lightbox';
import { PhotoImage } from './PhotoImage';
import { RandomPhotoButton } from './RandomPhotoButton';
import { UploadModal } from './UploadModal';
import type { FotoItem } from './types';

const POEMA_ALBUM = 'guardar a luz de um dia comum para voltar nela depois';
const MASONRY_ROW = 8;
const MASONRY_GAP = 18;
const PLACEHOLDER_HEIGHT = 340;

function AlbumPhotoCard({
  foto,
  onOpen,
  priority,
}: {
  foto: FotoItem;
  onOpen: (foto: FotoItem) => void;
  priority: boolean;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const revealFrame = useRef<number | null>(null);
  const [height, setHeight] = useState(PLACEHOLDER_HEIGHT);
  const [span, setSpan] = useState(
    Math.ceil((PLACEHOLDER_HEIGHT + MASONRY_GAP) / (MASONRY_ROW + MASONRY_GAP)),
  );
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const item = itemRef.current;
    const card = cardRef.current;
    if (!item || !card) return;

    const grid = item.parentElement;
    const styles = grid ? window.getComputedStyle(grid) : null;
    const rowGap = styles ? parseFloat(styles.rowGap || '0') : MASONRY_GAP;
    const cssRowHeight = styles
      ? parseFloat(styles.gridAutoRows || '')
      : Number.NaN;
    const rowHeight = Number.isFinite(cssRowHeight) ? cssRowHeight : MASONRY_ROW;
    const measuredHeight = card.offsetHeight;
    const next = Math.ceil((measuredHeight + rowGap) / (rowHeight + rowGap));

    setHeight(measuredHeight);
    setSpan(Math.max(1, next));
  }, []);

  const reveal = useCallback(() => {
    if (revealFrame.current != null) cancelAnimationFrame(revealFrame.current);
    revealFrame.current = requestAnimationFrame(() => {
      measure();
      revealFrame.current = requestAnimationFrame(() => setReady(true));
    });
  }, [measure]);

  useEffect(() => {
    setReady(false);
    setHeight(PLACEHOLDER_HEIGHT);
    setSpan(
      Math.ceil(
        (PLACEHOLDER_HEIGHT + MASONRY_GAP) / (MASONRY_ROW + MASONRY_GAP),
      ),
    );
  }, [foto.id]);

  useEffect(() => {
    if (!ready || !cardRef.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [measure, ready]);

  useEffect(
    () => () => {
      if (revealFrame.current != null) cancelAnimationFrame(revealFrame.current);
    },
    [],
  );

  return (
    <div
      ref={itemRef}
      className={`photo-grid-item ${ready ? 'is-ready' : 'is-loading'}`}
      style={{ gridRowEnd: `span ${span}`, height }}
      aria-busy={!ready}
    >
      <div
        className="photo-card-skeleton card-metal-edge"
        aria-hidden={ready}
      >
        <div className="photo-skeleton-image skeleton" />
        <div className="photo-skeleton-meta">
          <div className="skeleton photo-skeleton-caption" />
          <div className="skeleton photo-skeleton-date" />
        </div>
      </div>
      <div
        ref={cardRef}
        className="photo-card photo-card-content card-metal-edge"
        onClick={() => ready && onOpen(foto)}
      >
        <PhotoImage
          id={foto.id}
          legenda={foto.legenda}
          className="album-photo-shell"
          imageClassName="album-photo"
          imageStyle={{ width: '100%' }}
          mode="natural"
          fit="contain"
          priority={priority}
          onStateChange={(state) => {
            if (state === 'error') reveal();
          }}
          onReady={reveal}
        />
        <div className="photo-meta">
          <div className="photo-cap">{foto.legenda ?? 'Uma lembrança nossa.'}</div>
          <div className="photo-date">{mesAno(foto.tiradaEm ?? foto.uploadedAt)}</div>
        </div>
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
      (foto) =>
        (foto.legenda ?? '').toLowerCase().includes(q) ||
        mesAno(foto.tiradaEm ?? foto.uploadedAt).toLowerCase().includes(q),
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
            onChange={(event) => setBusca(event.target.value)}
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
          {filtradas.map((foto, index) => (
            <AlbumPhotoCard
              key={foto.id}
              foto={foto}
              onOpen={setLightbox}
              priority={index < 4}
            />
          ))}
        </div>
      )}

      {upload && (
        <UploadModal
          onClose={() => setUpload(false)}
          onUploaded={() => router.refresh()}
        />
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
