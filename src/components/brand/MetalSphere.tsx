'use client';

import { useId, type CSSProperties } from 'react';

type Props = {
  size?: number;
  style?: CSSProperties;
  className?: string;
};

export function MetalSphere({ size = 64, style, className }: Props) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={id} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#EDEFF0" />
          <stop offset="22%" stopColor="#C9CDD0" />
          <stop offset="55%" stopColor="#93979A" />
          <stop offset="82%" stopColor="#54585B" />
          <stop offset="100%" stopColor="#2F3134" />
        </radialGradient>
        <radialGradient id={`${id}h`} cx="34%" cy="26%" r="26%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="45" fill="rgba(0,0,0,.35)" />
      <circle cx="50" cy="50" r="45" fill={`url(#${id})`} />
      <ellipse cx="40" cy="36" rx="20" ry="14" fill={`url(#${id}h)`} />
      <rect x="46" y="60" width="2.4" height="11" rx="1" fill="#1c1d1f" opacity=".55" />
    </svg>
  );
}
