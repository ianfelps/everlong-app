'use client';

import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { apiJson, ApiClientError } from '@/lib/api';

export function SealModal({
  onClose,
  onSealed,
}: {
  onClose: () => void;
  onSealed: () => void;
}) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [quando, setQuando] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function selar() {
    if (!titulo.trim() || !conteudo.trim() || !quando) return;
    setEnviando(true);
    setErro(null);
    try {
      await apiJson('/api/capsulas', 'POST', {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        data_desbloqueio: new Date(quando).toISOString(),
      });
      onSealed();
      onClose();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao selar');
      setEnviando(false);
    }
  }

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal card pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Selar nova mensagem</h3>
          <button className="modal-x" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ marginTop: 0 }}>
            <label>Título</label>
            <input
              type="text"
              placeholder="Carta para nós em 10 anos…"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Mensagem</label>
            <textarea
              rows={4}
              placeholder="Escreva o que só deve ser lido lá na frente…"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Abrir em</label>
            <input
              type="datetime-local"
              value={quando}
              onChange={(e) => setQuando(e.target.value)}
            />
          </div>
          {erro && <div className="login-error">{erro}</div>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={selar}
            disabled={enviando || !titulo.trim() || !conteudo.trim() || !quando}
          >
            <Lock size={16} /> {enviando ? 'Selando…' : 'Selar cápsula'}
          </button>
        </div>
      </div>
    </div>
  );
}
