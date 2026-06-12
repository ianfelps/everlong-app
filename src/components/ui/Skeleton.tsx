import type { CSSProperties } from 'react';

type Props = {
  className?: string;
  style?: CSSProperties;
  label?: string;
};

export function Skeleton({
  className = '',
  style,
  label = 'Carregando',
}: Props) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={style}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
