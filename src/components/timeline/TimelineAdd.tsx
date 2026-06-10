'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { EventModal } from './EventModal';

export function TimelineAdd() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setAberto(true)}>
        <Plus size={16} /> Adicionar marco
      </button>
      {aberto && <EventModal mode="create" onClose={() => setAberto(false)} />}
    </>
  );
}
