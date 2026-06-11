'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Send } from 'lucide-react';
import { apiGet, apiJson, ApiClientError } from '@/lib/api';
import { CORES_RECADO, hexDaCor } from '@/lib/colors';
import { tempoRelativo } from '@/lib/format';

type RecadoRow = {
  id: string;
  conteudo: string;
  cor: string;
  autorId: string;
  createdAt: string;
  live?: boolean;
};

type RecadoView = RecadoRow & {
  rotacao: number;
};

const POLL_MS = 10_000;
const rndRot = () => Math.round(Math.random() * 8 - 4);
type Ordem = 'desc' | 'asc';

export function Board({
  inicial,
  perfis,
  meuId,
}: {
  inicial: RecadoRow[];
  perfis: Record<string, string>;
  meuId: string;
}) {
  const [notes, setNotes] = useState<RecadoView[]>(
    inicial.map((note) => ({ ...note, rotacao: rndRot() })),
  );
  const [text, setText] = useState('');
  const [cor, setCor] = useState(CORES_RECADO[0]!.nome);
  const [ordem, setOrdem] = useState<Ordem>('desc');
  const conhecidos = useRef(new Set(inicial.map((n) => n.id)));

  const sincronizar = useCallback(async () => {
    try {
      const rows = await apiGet<RecadoRow[]>(`/api/recados?order=${ordem}`);
      setNotes((prev) => {
        const rotPorId = new Map(prev.map((n) => [n.id, n.rotacao]));
        return rows.map((r) => ({
          ...r,
          live: !conhecidos.current.has(r.id) && r.autorId !== meuId,
          rotacao: rotPorId.get(r.id) ?? rndRot(),
        }));
      });
      rows.forEach((r) => conhecidos.current.add(r.id));
    } catch {
      
    }
  }, [meuId, ordem]);

  useEffect(() => {
    void sincronizar();
    const t = setInterval(sincronizar, POLL_MS);
    return () => clearInterval(t);
  }, [sincronizar]);

  async function colar() {
    const conteudo = text.trim();
    if (!conteudo) return;
    const rotacao = rndRot();
    const otimista: RecadoView = {
      id: `tmp-${Date.now()}`,
      conteudo,
      cor,
      autorId: meuId,
      rotacao,
      createdAt: new Date().toISOString(),
    };
    setNotes((n) => (ordem === 'desc' ? [otimista, ...n] : [...n, otimista]));
    setText('');
    try {
      const row = await apiJson<RecadoRow>('/api/recados', 'POST', {
        conteudo,
        cor,
      });
      if (row) {
        conhecidos.current.add(row.id);
        setNotes((n) => n.map((x) => (x.id === otimista.id ? { ...row, rotacao } : x)));
      }
    } catch (e) {
      setNotes((n) => n.filter((x) => x.id !== otimista.id));
      if (!(e instanceof ApiClientError)) throw e;
    }
  }

  return (
    <div className="page shell fade-in" style={{ paddingBottom: 120 }}>
      <div className="page-head">
        <h1 className="page-title">Mural de recados</h1>
        <p className="page-sub">
          deixe um bilhete onde o outro vai sorrir ao encontrar. Os recados aparecem para os dois.
        </p>
        <div className="board-filters" aria-label="Ordenar recados">
          <button
            type="button"
            className={ordem === 'desc' ? 'on' : ''}
            onClick={() => setOrdem('desc')}
          >
            <ArrowDown size={15} /> Recentes
          </button>
          <button
            type="button"
            className={ordem === 'asc' ? 'on' : ''}
            onClick={() => setOrdem('asc')}
          >
            <ArrowUp size={15} /> Antigos
          </button>
        </div>
      </div>

      <div className="board-canvas">
        <div className="board-live">
          <span className="live-dot" /> ao vivo
        </div>
        <div className="postit-flow">
          {notes.map((r) => (
            <div
              key={r.id}
              className={`postit ${r.live ? 'pop-in' : ''}`}
              style={{ background: hexDaCor(r.cor), transform: `rotate(${r.rotacao}deg)` }}
            >
              <p>{r.conteudo}</p>
              <div className="postit-foot">
                <span>— {perfis[r.autorId] ?? 'alguém'}</span>
                <span>{tempoRelativo(r.createdAt)}</span>
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="mono" style={{ color: 'var(--ink-faint)' }}>
              nenhum recado ainda — cole o primeiro.
            </p>
          )}
        </div>
      </div>

      <div className="composer">
        <div className="swatches">
          {CORES_RECADO.map((c) => (
            <span
              key={c.nome}
              className={`swatch ${c.nome === cor ? 'on' : ''}`}
              style={{ background: c.hex }}
              onClick={() => setCor(c.nome)}
              title={c.nome}
            />
          ))}
        </div>
        <input
          placeholder="Escreva um recado para o mural…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') colar();
          }}
        />
        <button className="btn btn-primary composer-send" onClick={colar}>
          <Send size={16} /> <span className="btn-label">Colar</span>
        </button>
      </div>
    </div>
  );
}
