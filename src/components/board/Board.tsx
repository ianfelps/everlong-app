'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, Heart, Pin, Send } from 'lucide-react';
import { apiGet, apiJson, ApiClientError } from '@/lib/api';
import { CORES_RECADO, hexDaCor } from '@/lib/colors';
import { tempoRelativo } from '@/lib/format';

type RecadoRow = {
  id: string;
  conteudo: string;
  cor: string;
  autorId: string;
  createdAt: string;
  fixadoEm: string | null;
  lidoEm: string | null;
  curtidas: number;
  curtidoPorMim: boolean;
  live?: boolean;
};

type RecadoView = RecadoRow & {
  rotacao: number;
};

type ArquivoResposta = {
  items: RecadoRow[];
  next_cursor: string | null;
};

type LeituraResposta = { ids: string[] };

const POLL_MS = 10_000;
const BOARD_GRID_ROW = 8;
const BOARD_GRID_GAP = 22;
const rndRot = () => Math.round(Math.random() * 8 - 4);

function comRotacao(rows: RecadoRow[], anteriores: RecadoView[]) {
  const rotPorId = new Map(anteriores.map((note) => [note.id, note.rotacao]));
  return rows.map((row) => ({
    ...row,
    rotacao: rotPorId.get(row.id) ?? rndRot(),
  }));
}

export function Board({
  inicial,
  perfis,
  meuId,
}: {
  inicial: RecadoRow[];
  perfis: Record<string, string>;
  meuId: string;
}) {
  const [notes, setNotes] = useState<RecadoView[]>(() =>
    inicial.map((note) => ({ ...note, rotacao: rndRot() })),
  );
  const [archive, setArchive] = useState<RecadoView[]>([]);
  const [archiveCursor, setArchiveCursor] = useState<string | null>(null);
  const [archiveStarted, setArchiveStarted] = useState(false);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [text, setText] = useState('');
  const [cor, setCor] = useState(CORES_RECADO[0]!.nome);
  const [error, setError] = useState<string | null>(null);
  const [noteSpans, setNoteSpans] = useState<Record<string, number>>({});
  const conhecidos = useRef(new Set(inicial.map((note) => note.id)));
  const boardRef = useRef<HTMLDivElement>(null);
  const leiturasPendentes = useRef(new Set<string>());
  const leituraTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sincronizar = useCallback(async () => {
    try {
      const rows = await apiGet<RecadoRow[]>('/api/recados');
      setNotes((prev) =>
        rows.map((row) => ({
          ...row,
          live: !conhecidos.current.has(row.id) && row.autorId !== meuId,
          rotacao: prev.find((note) => note.id === row.id)?.rotacao ?? rndRot(),
        })),
      );
      rows.forEach((row) => conhecidos.current.add(row.id));
    } catch {
      setError('Não foi possível atualizar o mural agora.');
    }
  }, [meuId]);

  const registrarLeituras = useCallback(() => {
    if (leituraTimer.current) return;
    leituraTimer.current = setTimeout(() => {
      const ids = [...leiturasPendentes.current];
      leiturasPendentes.current.clear();
      leituraTimer.current = null;
      if (ids.length === 0) return;
      void apiJson<LeituraResposta>('/api/recados/lidos', 'POST', { ids })
        .then((result) => {
          if (!result || result.ids.length === 0) return;
          const lidoEm = new Date().toISOString();
          const marcou = new Set(result.ids);
          setNotes((prev) =>
            prev.map((note) => (marcou.has(note.id) ? { ...note, lidoEm } : note)),
          );
          setArchive((prev) =>
            prev.map((note) => (marcou.has(note.id) ? { ...note, lidoEm } : note)),
          );
        })
        .catch(() => {});
    }, 300);
  }, []);

  useEffect(() => {
    void sincronizar();
    const timer = setInterval(sincronizar, POLL_MS);
    return () => clearInterval(timer);
  }, [sincronizar]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute('data-recado-id');
          const autorId = entry.target.getAttribute('data-autor-id');
          const lidoEm = entry.target.getAttribute('data-lido-em');
          if (id && autorId !== meuId && !lidoEm) leiturasPendentes.current.add(id);
        }
        registrarLeituras();
      },
      { threshold: 0.7 },
    );
    board.querySelectorAll<HTMLElement>('[data-recado-id]').forEach((note) =>
      observer.observe(note),
    );
    return () => observer.disconnect();
  }, [archive, meuId, notes, registrarLeituras]);

  useEffect(
    () => () => {
      if (leituraTimer.current) clearTimeout(leituraTimer.current);
    },
    [],
  );

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const measure = (note: HTMLElement) => {
      const id = note.getAttribute('data-recado-id');
      const grid = note.parentElement;
      if (!id || !grid) return;

      const styles = window.getComputedStyle(grid);
      const rowGap = parseFloat(styles.rowGap) || BOARD_GRID_GAP;
      const rowHeight = parseFloat(styles.gridAutoRows) || BOARD_GRID_ROW;
      const span = Math.max(
        1,
        Math.ceil((note.offsetHeight + rowGap) / (rowHeight + rowGap)),
      );

      setNoteSpans((prev) => (prev[id] === span ? prev : { ...prev, [id]: span }));
    };

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target instanceof HTMLElement) measure(entry.target);
      });
    });
    const notes = board.querySelectorAll<HTMLElement>('[data-recado-id]');
    notes.forEach((note) => {
      measure(note);
      observer.observe(note);
    });

    return () => observer.disconnect();
  }, [archive, notes]);

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
      fixadoEm: null,
      lidoEm: null,
      curtidas: 0,
      curtidoPorMim: false,
    };
    setNotes((prev) => [otimista, ...prev].slice(0, 11));
    setText('');
    setError(null);
    try {
      const row = await apiJson<RecadoRow>('/api/recados', 'POST', { conteudo, cor });
      if (row) {
        conhecidos.current.add(row.id);
        setNotes((prev) =>
          prev.map((note) => (note.id === otimista.id ? { ...row, rotacao } : note)),
        );
      }
    } catch (caught) {
      setNotes((prev) => prev.filter((note) => note.id !== otimista.id));
      if (caught instanceof ApiClientError) setError(caught.message);
    }
  }

  async function alternarFixacao(note: RecadoView) {
    const fixado = note.fixadoEm === null;
    setError(null);
    try {
      await apiJson(`/api/recados/${note.id}`, 'PATCH', { fixado });
      await sincronizar();
      if (fixado) setArchive((prev) => prev.filter((item) => item.id !== note.id));
    } catch (caught) {
      if (caught instanceof ApiClientError) setError(caught.message);
    }
  }

  async function alternarCurtida(note: RecadoView) {
    const curtidoPorMim = !note.curtidoPorMim;
    const atualizar = (items: RecadoView[]) =>
      items.map((item) =>
        item.id === note.id
          ? {
              ...item,
              curtidoPorMim,
              curtidas: Math.max(0, item.curtidas + (curtidoPorMim ? 1 : -1)),
            }
          : item,
      );
    setNotes(atualizar);
    setArchive(atualizar);
    try {
      await apiJson(
        `/api/recados/${note.id}/curtida`,
        curtidoPorMim ? 'PUT' : 'DELETE',
      );
    } catch (caught) {
      const desfazer = (items: RecadoView[]) =>
        items.map((item) =>
          item.id === note.id
            ? {
                ...item,
                curtidoPorMim: !curtidoPorMim,
                curtidas: Math.max(0, item.curtidas + (curtidoPorMim ? -1 : 1)),
              }
            : item,
        );
      setNotes(desfazer);
      setArchive(desfazer);
      if (caught instanceof ApiClientError) setError(caught.message);
    }
  }

  async function carregarArquivo() {
    if (loadingArchive) return;
    setLoadingArchive(true);
    setError(null);
    try {
      const query = new URLSearchParams({ scope: 'archive', limit: '20' });
      if (archiveCursor) query.set('cursor', archiveCursor);
      const resposta = await apiGet<ArquivoResposta>(`/api/recados?${query}`);
      setArchive((prev) => [...prev, ...comRotacao(resposta.items, prev)]);
      setArchiveCursor(resposta.next_cursor);
      setArchiveStarted(true);
    } catch (caught) {
      if (caught instanceof ApiClientError) setError(caught.message);
    } finally {
      setLoadingArchive(false);
    }
  }

  function renderRecado(note: RecadoView) {
    const meuRecado = note.autorId === meuId;
    const fixado = note.fixadoEm !== null;
    return (
      <article
        key={note.id}
        className={`postit ${note.live ? 'pop-in' : ''} ${fixado ? 'is-pinned' : ''}`}
        data-recado-id={note.id}
        data-autor-id={note.autorId}
        data-lido-em={note.lidoEm ?? ''}
        style={{
          background: hexDaCor(note.cor),
          gridRowEnd: `span ${noteSpans[note.id] ?? 8}`,
          transform: `rotate(${note.rotacao}deg)`,
        }}
      >
        <div className="postit-actions">
          <button
            className={`postit-action ${fixado ? 'is-active' : ''}`}
            type="button"
            onClick={() => void alternarFixacao(note)}
            aria-label={fixado ? 'Desafixar recado' : 'Fixar recado'}
            title={fixado ? 'Desafixar' : 'Fixar'}
          >
            <Pin size={15} />
          </button>
          <button
            className={`postit-action ${note.curtidoPorMim ? 'is-active' : ''}`}
            type="button"
            onClick={() => void alternarCurtida(note)}
            aria-label={note.curtidoPorMim ? 'Remover coração' : 'Adicionar coração'}
            title={note.curtidoPorMim ? 'Remover coração' : 'Adicionar coração'}
          >
            <Heart size={15} fill={note.curtidoPorMim ? 'currentColor' : 'none'} />
            {note.curtidas > 0 && <span>{note.curtidas}</span>}
          </button>
        </div>
        <p>{note.conteudo}</p>
        <div className="postit-foot">
          <span>— {perfis[note.autorId] ?? 'alguém'}</span>
          <span>{tempoRelativo(note.createdAt)}</span>
        </div>
        {meuRecado && note.lidoEm && (
          <div className="postit-seen">
            <Eye size={13} /> visto
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="page shell fade-in" ref={boardRef}>
      <div className="page-head">
        <h1 className="page-title">Mural de recados</h1>
        <p className="page-sub">
          Deixe uma frase pequena para o outro encontrar no meio do dia.
        </p>
      </div>

      {error && <p className="board-error" role="alert">{error}</p>}

      <div className="board-canvas">
        <div className="postit-flow">
          {notes.map(renderRecado)}
          {notes.length === 0 && (
            <p className="mono" style={{ color: 'var(--ink-faint)' }}>
              nenhum recado ainda — deixa o primeiro aqui.
            </p>
          )}
        </div>
      </div>

      <div className="composer">
        <div className="swatches" aria-label="Cor do recado">
          {CORES_RECADO.map((item) => (
            <button
              key={item.nome}
              className={`swatch ${item.nome === cor ? 'on' : ''}`}
              type="button"
              style={{ background: item.hex }}
              onClick={() => setCor(item.nome)}
              aria-label={`Usar a cor ${item.nome}`}
              aria-pressed={item.nome === cor}
            />
          ))}
        </div>
        <input
          placeholder="Escreva um bilhete rápido…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void colar();
          }}
        />
        <button className="btn btn-primary composer-send" type="button" onClick={() => void colar()}>
          <Send size={16} /> <span className="btn-label">Colar</span>
        </button>
      </div>

      <section className="board-archive">
        <div className="section-h">
          <div>
            <h2>Arquivo</h2>
            <p className="page-sub">Bilhetes que continuam guardados depois da semana passar.</p>
          </div>
          {(!archiveStarted || archiveCursor) && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => void carregarArquivo()}
              disabled={loadingArchive}
              aria-busy={loadingArchive}
            >
              {archiveStarted ? 'Carregar mais' : 'Ver recados antigos'}
            </button>
          )}
        </div>
        {archiveStarted && (
          <div className="postit-flow board-archive-flow">
            {archive.map(renderRecado)}
            {archive.length === 0 && (
              <p className="mono" style={{ color: 'var(--ink-faint)' }}>
                nenhum recado antigo para mostrar ainda.
              </p>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
