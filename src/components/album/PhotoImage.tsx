'use client';

import { useState, type CSSProperties } from 'react';

type Props = {
  id: string;
  legenda?: string | null;
  
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function PhotoImage({ id, legenda, label, className, style }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const texto = label ?? legenda ?? 'memória';

  return (
    <div className={`ph ${className ?? ''}`.trim()} style={style}>
      {state !== 'error' && (
        <img
          src={`/api/fotos/${id}/binario`}
          alt={legenda ?? 'foto do álbum'}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: state === 'ok' ? 1 : 0,
            transition: 'opacity .3s ease',
          }}
        />
      )}
      {state !== 'ok' && <span className="ph-label">{texto}</span>}
    </div>
  );
}
