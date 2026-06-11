'use client';

import { useRef, useState } from 'react';
import { X, Lock, ImagePlus } from 'lucide-react';
import { apiForm, ApiClientError } from '@/lib/api';
import { ModalPortal } from '@/components/ui/ModalPortal';

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
  const [fotos, setFotos] = useState<File[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function adicionarFotos(list: FileList | null | undefined) {
    if (!list) return;
    setFotos((atuais) => [...atuais, ...Array.from(list)]);
    setErro(null);
  }

  async function selar() {
    if (!titulo.trim() || !conteudo.trim() || !quando) return;
    setEnviando(true);
    setErro(null);
    try {
      const form = new FormData();
      form.set('titulo', titulo.trim());
      form.set('conteudo', conteudo.trim());
      form.set('data_desbloqueio', new Date(quando).toISOString());
      fotos.forEach((foto) => form.append('fotos', foto));
      await apiForm('/api/capsulas', form);
      onSealed();
      onClose();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha ao selar');
      setEnviando(false);
    }
  }

  return (
    <ModalPortal onClose={onClose}>
      <div className="modal card pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Guardar uma carta</h3>
          <button className="modal-x" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ marginTop: 0 }}>
            <label>Título</label>
            <input
              type="text"
              placeholder="Para a gente ler quando sentir saudade…"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Mensagem</label>
            <textarea
              rows={4}
              placeholder="Escreva sem pressa, como se o futuro estivesse escutando…"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Quando abrir</label>
            <input
              type="datetime-local"
              value={quando}
              onChange={(e) => setQuando(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Fotos</label>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic"
              style={{ display: 'none' }}
              onChange={(e) => adicionarFotos(e.target.files)}
            />
            <button
              type="button"
              className="btn btn-metal"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus size={16} /> Adicionar fotos
            </button>
            {fotos.length > 0 && (
              <div className="capsule-files">
                {fotos.map((foto, i) => (
                  <span key={`${foto.name}-${foto.size}-${i}`}>
                    {foto.name}
                    <button
                      type="button"
                      aria-label={`Remover foto ${foto.name}`}
                      onClick={() => setFotos((atuais) => atuais.filter((_, idx) => idx !== i))}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
            <Lock size={16} /> {enviando ? 'Guardando…' : 'Guardar para depois'}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
