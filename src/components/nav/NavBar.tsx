'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Film,
  GitCommitVertical,
  Home,
  Images,
  Lock,
  LogOut,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { MolecularField } from '@/components/brand/MolecularField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiJson } from '@/lib/api';

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/album', label: 'Álbum', icon: Images },
  { href: '/filmes', label: 'Filmes', icon: Film },
  { href: '/timeline', label: 'Linha do Tempo', icon: GitCommitVertical },
  { href: '/capsule', label: 'Cápsula', icon: Lock },
  { href: '/board', label: 'Recados', icon: MessageSquare },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    await apiJson('/api/auth/logout', 'POST').catch(() => {});
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="nav-wrap">
      <div className="nav-inner card card-metal-edge">
        <MolecularField opacity={0.07} style={{ filter: 'saturate(0)' }} />
        <Link className="nav-logo" href="/home" title="Início">
          <Logo size={30} />
        </Link>
        <nav className="nav-links">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="nav-right">
          <button
            className="nav-avatar"
            title="Sair"
            onClick={sair}
            disabled={saindo}
            aria-busy={saindo}
          >
            {saindo ? (
              <LoadingSpinner size={15} label="Saindo" />
            ) : (
              <LogOut size={15} color="var(--red)" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
