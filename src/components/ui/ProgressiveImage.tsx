'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from 'react';

export type ImageLoadState = 'loading' | 'ready' | 'error';

type Props = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
  fit?: CSSProperties['objectFit'];
  priority?: boolean;
  mode?: 'fill' | 'natural';
  fallbackLabel?: string;
  onStateChange?: (state: ImageLoadState) => void;
  onReady?: (image: HTMLImageElement) => void;
  decoding?: ImgHTMLAttributes<HTMLImageElement>['decoding'];
};

export function ProgressiveImage({
  src,
  alt,
  className = '',
  imageClassName = '',
  style,
  imageStyle,
  fit = 'cover',
  priority = false,
  mode = 'fill',
  fallbackLabel = 'Imagem indisponível',
  onStateChange,
  onReady,
  decoding = 'async',
}: Props) {
  const [state, setState] = useState<ImageLoadState>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  function update(next: ImageLoadState) {
    setState(next);
    onStateChange?.(next);
  }

  function markReady(image: HTMLImageElement) {
    update('ready');
    onReady?.(image);
  }

  useEffect(() => {
    update('loading');
    const image = imgRef.current;
    if (!image?.complete) return;

    if (image.naturalWidth > 0) {
      markReady(image);
    } else {
      update('error');
    }
    // Callbacks intentionally follow the current image source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const natural = mode === 'natural';

  return (
    <div
      className={`progressive-image progressive-image-${mode} is-${state} ${className}`.trim()}
      style={style}
      aria-busy={state === 'loading'}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={imageClassName}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={decoding}
        onLoad={(event) => markReady(event.currentTarget)}
        onError={() => update('error')}
        style={{
          ...(natural
            ? {
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
              }
            : {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }),
          objectFit: fit,
          ...imageStyle,
        }}
      />
      <span className="progressive-image-placeholder" aria-hidden="true" />
      {state === 'error' && (
        <span className="progressive-image-error" role="img" aria-label={fallbackLabel}>
          {fallbackLabel}
        </span>
      )}
    </div>
  );
}
