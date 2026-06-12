'use client';

import type { CSSProperties } from 'react';
import {
  ProgressiveImage,
  type ImageLoadState,
} from '@/components/ui/ProgressiveImage';

type Props = {
  id: string;
  legenda?: string | null;
  label?: string;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
  fit?: CSSProperties['objectFit'];
  priority?: boolean;
  mode?: 'fill' | 'natural';
  onStateChange?: (state: ImageLoadState) => void;
  onReady?: (image: HTMLImageElement) => void;
};

export function PhotoImage({
  id,
  legenda,
  label,
  className,
  imageClassName,
  style,
  imageStyle,
  fit = 'cover',
  priority = false,
  mode = 'fill',
  onStateChange,
  onReady,
}: Props) {
  return (
    <ProgressiveImage
      src={`/api/fotos/${id}/binario`}
      alt={legenda ?? 'foto do album'}
      fallbackLabel={label ?? legenda ?? 'memoria'}
      className={className}
      imageClassName={imageClassName}
      style={style}
      imageStyle={imageStyle}
      fit={fit}
      priority={priority}
      mode={mode}
      onStateChange={onStateChange}
      onReady={onReady}
    />
  );
}
