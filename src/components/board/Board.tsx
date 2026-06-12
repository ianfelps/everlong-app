'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { apiGet, apiJson, ApiClientError } from '@/lib/api';
import { CORES_RECADO, hexDaCor } from '@/lib/colors';
import { tempoRelativo } from '@/lib/format';
import { limitarRecados } from '@/lib/recados';

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
  const conhecidos = useRef(new Set(inicial.map((n) => n.id)));

  const sincronizar = useCallback(async () => {
    try {
      const rows = await apiGet<RecadoRow[]>('/api/recados');
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
  }, [meuId]);

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
    setNotes((n) =>
      limitarRecados([otimista, ...n], 'desc'),
    );
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
          Deixe uma frase pequena para o outro encontrar no meio do dia.
        </p>
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
              nenhum recado ainda — deixa o primeiro aqui.
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
          placeholder="Escreva um bilhete rápido…"
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
