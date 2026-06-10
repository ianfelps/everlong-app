'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function ModalPortal({
  children,
  onClose,
  className = 'modal-veil',
}: {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={className} onClick={onClose}>
      {children}
    </div>,
    document.body,
  );
}
