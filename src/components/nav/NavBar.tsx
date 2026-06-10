'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Images,
  GitCommitVertical,
  Lock,
  MessageSquare,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { MolecularField } from '@/components/brand/MolecularField';
import { apiJson } from '@/lib/api';

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/album', label: 'Álbum', icon: Images },
  { href: '/timeline', label: 'Linha do Tempo', icon: GitCommitVertical },
  { href: '/capsule', label: 'Cápsula', icon: Lock },
  { href: '/board', label: 'Recados', icon: MessageSquare },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
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
          {NAV.map((n) => {
            const active = pathname === n.href;
            const Ico = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`nav-link ${active ? 'is-active' : ''}`}
              >
                <Ico size={17} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="nav-right">
          <button className="nav-avatar" title="Sair" onClick={sair}>
            <LogOut size={15} color="var(--red)" />
          </button>
        </div>
      </div>
    </header>
  );
}
