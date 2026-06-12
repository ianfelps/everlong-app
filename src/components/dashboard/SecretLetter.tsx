'use client';

import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { renderInlineMarkdown } from '@/lib/inline-markdown';

export function SecretLetter({
  destinataria = 'meu amor',
  letter,
}: {
  destinataria?: string;
  letter?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const paragraphs = letter
    ?.replace(/\\n/g, '\n')
    ?.split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs?.length) return null;

  return (
    <>
      <footer className="home-secret-foot">
        <button
          type="button"
          className="home-secret-btn"
          onClick={() => setOpen(true)}
          aria-label="Abrir carta escondida"
        >
          <Mail size={14} />
          <span>Carta para meu amor</span>
        </button>
      </footer>

      {open && (
        <ModalPortal onClose={() => setOpen(false)}>
          <div className="modal card pop-in secret-letter" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Para {destinataria}</h3>
              <button className="modal-x" onClick={() => setOpen(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{renderInlineMarkdown(paragraph, `paragraph-${index}`)}</p>
              ))}
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
