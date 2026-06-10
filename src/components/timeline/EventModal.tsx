'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Trash2 } from 'lucide-react';
import { apiJson, ApiClientError } from '@/lib/api';

export type EventData = {
  id: string;
  titulo: string;
  descricao: string | null;
  dataEvento: string;
};

function paraInputDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function EventModal({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: EventData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(initial?.titulo ?? '');
  const [descricao, setDescricao] = useState(initial?.descricao ?? '');
  const [data, setData] = useState(initial ? paraInputDate(initial.dataEvento) : '');
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  async function salvar() {
    if (!titulo.trim() || !data) return;
    setBusy(true);
    setErro(null);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim() ? descricao.trim() : null,
        data_evento: new Date(data).toISOString(),
      };
      if (mode === 'create') {
        await apiJson('/api/eventos', 'POST', payload);
      } else {
        await apiJson(`/api/eventos/${initial!.id}`, 'PATCH', payload);
      }
      onClose();
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao salvar');
    } finally {
      setBusy(false);
    }
  }

  async function excluir() {
    if (!initial) return;
    setBusy(true);
    setErro(null);
    try {
      await apiJson(`/api/eventos/${initial.id}`, 'DELETE');
      onClose();
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao excluir');
      setBusy(false);
    }
  }

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal card pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{mode === 'create' ? 'Novo marco' : 'Editar marco'}</h3>
          <button className="modal-x" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ marginTop: 0 }}>
            <label>Título</label>
            <input
              type="text"
              placeholder="O primeiro encontro…"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="field">
            <label>O que aconteceu</label>
            <textarea
              rows={3}
              placeholder="Conte esse momento da história de vocês…"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          {erro && <div className="login-error">{erro}</div>}
        </div>
        <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
          {mode === 'edit' ? (
            confirmar ? (
              <button className="btn btn-ghost btn-sm" onClick={excluir} disabled={busy}>
                <Trash2 size={15} /> {busy ? 'Excluindo…' : 'Confirmar exclusão'}
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmar(true)}
                disabled={busy}
              >
                <Trash2 size={15} /> Excluir
              </button>
            )
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={salvar}
              disabled={busy || !titulo.trim() || !data}
            >
              <Check size={16} /> {busy ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
