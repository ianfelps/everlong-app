'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { MetalSphere } from '@/components/brand/MetalSphere';
import { EventModal } from './EventModal';
import { dataCurta } from '@/lib/format';

export type TimelineEvent = {
  id: string;
  titulo: string;
  descricao: string | null;
  dataEvento: string;
};

export function TimelineItem({
  ev,
  side,
  index,
}: {
  ev: TimelineEvent;
  side: 'left' | 'right';
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [editar, setEditar] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setVis(true);
          o.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    o.observe(node);
    return () => o.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`tl-item ${side}`}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(26px)',
        transition: 'opacity .6s ease, transform .6s ease',
        transitionDelay: `${(index % 2) * 0.05}s`,
      }}
    >
      <button
        type="button"
        className="tl-bubble card-metal-edge"
        onClick={() => setEditar(true)}
        title="Editar marco"
      >
        <span className="tl-edit">
          <Pencil size={13} />
        </span>
        <div className="tl-date">{dataCurta(ev.dataEvento)}</div>
        <h4>{ev.titulo}</h4>
        {ev.descricao && <p>{ev.descricao}</p>}
      </button>
      <span className="tl-node">
        <MetalSphere size={42} />
      </span>

      {editar && (
        <EventModal
          mode="edit"
          initial={{
            id: ev.id,
            titulo: ev.titulo,
            descricao: ev.descricao,
            dataEvento: ev.dataEvento,
          }}
          onClose={() => setEditar(false)}
        />
      )}
    </div>
  );
}
