'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Props = {
  id: string;
  legenda?: string | null;
  
  label?: string;
  className?: string;
  style?: CSSProperties;
  fit?: CSSProperties['objectFit'];
};

export function PhotoImage({ id, legenda, label, className, style, fit = 'cover' }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);
  const texto = label ?? legenda ?? 'memória';

  useEffect(() => {
    setState('loading');
  }, [id]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) setState('ok');
    if (img.complete && img.naturalWidth === 0) setState('error');
  }, [id]);

  return (
    <div className={`ph ${className ?? ''}`.trim()} style={style}>
      <img
        ref={imgRef}
        src={`/api/fotos/${id}/binario`}
        alt={legenda ?? 'foto do álbum'}
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: fit,
          opacity: state === 'ok' ? 1 : 0,
          transition: 'opacity .3s ease',
        }}
      />
      {state !== 'ok' && <span className="ph-label">{texto}</span>}
    </div>
  );
}
