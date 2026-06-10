import type { CSSProperties } from 'react';

type Props = {
  size?: number;
  style?: CSSProperties;
  className?: string;
};

export function Logo({ size = 40, style, className = '' }: Props) {
  return (
    <span className={`logo ${className}`.trim()} style={{ fontSize: size, ...style }}>
      Everlong
    </span>
  );
}
