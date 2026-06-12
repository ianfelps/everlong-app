'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Lock } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { MolecularField } from '@/components/brand/MolecularField';
import { apiGet, apiJson, ApiClientError } from '@/lib/api';

type Perfil = { id: string; nome: string };

export default function LoginPage() {
  const router = useRouter();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    apiGet<Perfil[]>('/api/perfis')
      .then(setPerfis)
      .catch(() => setErro('não foi possível carregar os perfis'));
  }, []);

  async function entrar() {
    if (!perfilId || !senha) return;
    setEnviando(true);
    setErro(null);
    try {
      await apiJson('/api/auth/login', 'POST', { perfil_id: perfilId, senha });
      router.push('/home');
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : 'falha ao entrar';
      setErro(msg);
      setEnviando(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card card card-metal-edge fade-in">
        <MolecularField opacity={0.08} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Logo size={56} />
          <p className="page-sub" style={{ margin: '14px auto 0', color: 'var(--ink-dim)' }}>
            Entre devagar. As nossas memórias estão aqui dentro.
          </p>

          <div className="login-profiles">
            {perfis.map((p) => (
              <button
                key={p.id}
                className={`profile-btn ${perfilId === p.id ? 'on' : ''}`}
                onClick={() => {
                  setPerfilId(p.id);
                  setErro(null);
                }}
              >
                <span className="nav-avatar" style={{ width: 32, height: 32 }}>
                  <Heart size={13} color="var(--red)" />
                </span>
                {p.nome}
              </button>
            ))}
            {perfis.length === 0 && !erro && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                carregando perfis…
              </span>
            )}
          </div>

          <div className="field" style={{ textAlign: 'left' }}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') entrar();
              }}
            />
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
            disabled={!perfilId || !senha || enviando}
            onClick={entrar}
          >
            <Lock size={16} /> {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
