'use client';

import { useId, type CSSProperties } from 'react';

const NODES: [number, number, number][] = [
  [50, 8, 5.5],
  [78, 20, 7],
  [26, 30, 6.5],
  [55, 33, 3.4],
  [20, 66, 4],
  [50, 92, 7.5],
  [70, 80, 4.2],
  [84, 55, 3],
];
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 5], [1, 7],
  [2, 4], [2, 5], [3, 5], [4, 5], [5, 6], [1, 6], [3, 7],
];

type Props = {
  opacity?: number;
  style?: CSSProperties;
  className?: string;
};

export function MolecularField({ opacity, style, className }: Props) {
  const id = useId().replace(/:/g, '');
  const op =
    opacity != null
      ? `calc(${opacity} * var(--mol-scale, 1))`
      : 'var(--molecular-opacity)';
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: op,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <defs>
        <radialGradient id={id} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#EDEFF0" />
          <stop offset="45%" stopColor="#9a9ea1" />
          <stop offset="100%" stopColor="#34363A" />
        </radialGradient>
      </defs>
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a]![0]}
          y1={NODES[a]![1]}
          x2={NODES[b]![0]}
          y2={NODES[b]![1]}
          stroke="#C9CDD0"
          strokeWidth=".5"
          strokeOpacity=".7"
        />
      ))}
      {NODES.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={`url(#${id})`} />
      ))}
    </svg>
  );
}
