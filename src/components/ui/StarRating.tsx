'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  label?: string;
};

export function StarRating({ value, onChange, size = 20, label }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const readOnly = !onChange;
  const ativo = hover ?? value;

  if (readOnly) {
    return (
      <span
        className="star-rating is-readonly"
        role="img"
        aria-label={label ?? `${value} de 5 estrelas`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= value ? 'star on' : 'star'}
            fill={n <= value ? 'currentColor' : 'none'}
          />
        ))}
      </span>
    );
  }

  return (
    <span className="star-rating" role="radiogroup" aria-label={label ?? 'Avaliação'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= ativo ? 'on' : ''}`}
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(null)}
          onClick={() => onChange(n)}
        >
          <Star size={size} fill={n <= ativo ? 'currentColor' : 'none'} />
        </button>
      ))}
    </span>
  );
}
