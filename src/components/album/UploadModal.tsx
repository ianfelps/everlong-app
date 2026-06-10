'use client';

import { useRef, useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { apiForm, ApiClientError } from '@/lib/api';
import { ModalPortal } from '@/components/ui/ModalPortal';

export function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [legenda, setLegenda] = useState('');
  const [data, setData] = useState('');
  const [drag, setDrag] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function escolher(f: File | undefined | null) {
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setErro(null);
  }

  async function guardar() {
    if (!file) return;
    setEnviando(true);
    setErro(null);
    try {
      const form = new FormData();
      form.set('arquivo', file);
      if (legenda.trim()) form.set('legenda', legenda.trim());
      if (data.trim()) {
        const dt = new Date(data);
        if (!Number.isNaN(dt.getTime())) form.set('tirada_em', dt.toISOString());
      }
      await apiForm('/api/fotos', form);
      onUploaded();
      onClose();
    } catch (e) {
      setErro(e instanceof ApiClientError ? e.message : 'falha no upload');
      setEnviando(false);
    }
  }

  const stage = file ? 'preview' : 'drop';

  return (
    <ModalPortal onClose={onClose}>
      <div className="modal card pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Adicionar foto</h3>
          <button className="modal-x" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            style={{ display: 'none' }}
            onChange={(e) => escolher(e.target.files?.[0])}
          />
          {stage === 'drop' ? (
            <div
              className={`dropzone ${drag ? 'drag' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                escolher(e.dataTransfer.files?.[0]);
              }}
            >
              <div className="dz-inner">
                <div className="dz-icon">
                  <Upload size={24} />
                </div>
                <div style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 15 }}>
                  Arraste uma foto aqui
                </div>
                <div style={{ fontSize: 13 }}>ou clique para escolher do dispositivo</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>
                  JPG · PNG · WEBP · HEIC — até 25 MB
                </div>
              </div>
            </div>
          ) : (
            <div className="fade-in">
              <div className="preview-wrap">
                <span className="preview-badge">pré-visualização</span>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="pré-visualização"
                    style={{
                      width: '100%',
                      height: 240,
                      objectFit: 'cover',
                      borderRadius: 12,
                      display: 'block',
                    }}
                  />
                ) : (
                  <div className="ph">
                    <span className="ph-label">foto selecionada</span>
                  </div>
                )}
              </div>
              <div className="field">
                <label>Legenda</label>
                <textarea
                  rows={2}
                  placeholder="Escreva uma lembrança sobre este momento…"
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Data (quando foi tirada)</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
            </div>
          )}
          {erro && <div className="login-error">{erro}</div>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          {stage === 'drop' ? (
            <button className="btn btn-metal" onClick={() => inputRef.current?.click()}>
              Escolher arquivo
            </button>
          ) : (
            <button className="btn btn-primary" onClick={guardar} disabled={enviando}>
              <Check size={16} /> {enviando ? 'Guardando…' : 'Guardar memória'}
            </button>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
