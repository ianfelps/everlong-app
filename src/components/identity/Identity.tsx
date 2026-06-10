'use client';

import Link from 'next/link';
import {
  Heart,
  Clock,
  Images,
  GitCommitVertical,
  Lock,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { MolecularField } from '@/components/brand/MolecularField';
import { MetalSphere } from '@/components/brand/MetalSphere';

const FEATURES: { icon: LucideIcon; titulo: string; texto: string }[] = [
  {
    icon: Clock,
    titulo: 'Cronômetro de namoro',
    texto: 'Cada segundo desde o primeiro dia, girando na mesma órbita.',
  },
  {
    icon: Images,
    titulo: 'Álbum',
    texto: 'Cada foto é um dia que vocês não querem esquecer.',
  },
  {
    icon: GitCommitVertical,
    titulo: 'Linha do tempo',
    texto: 'Os capítulos da história de vocês, em ordem.',
  },
  {
    icon: Lock,
    titulo: 'Cápsula do tempo',
    texto: 'Mensagens seladas para abrir só quando chegar a hora.',
  },
  {
    icon: MessageSquare,
    titulo: 'Mural de recados',
    texto: 'Bilhetes que aparecem para os dois, em tempo real.',
  },
];

export function Identity({ enterHref }: { enterHref: string }) {
  return (
    <div className="landing fade-in">
      <section className="lp-hero card-metal-edge">
        <MolecularField opacity={0.16} />
        <div className="lp-hero-inner">
          <span className="eyebrow">Álbum de memórias de casal</span>
          <Logo size={104} className="lp-logo" />
          <p className="lp-tagline serif-note">O tempo de vocês, guardado para sempre.</p>
          <p className="page-sub lp-sub">
            Um cantinho só de vocês dois. Fotos, recados, a linha do tempo da relação e cápsulas
            para abrir no futuro — todas as memórias guardadas em um só lugar.
          </p>
          <div className="lp-actions">
            <Link href={enterHref} className="btn btn-primary lp-cta">
              <Heart size={17} color="#fff" /> Entrar no Everlong
            </Link>
            <a href="#recursos" className="btn btn-ghost lp-cta">
              Conhecer
            </a>
          </div>
        </div>
      </section>

      <section id="recursos" className="lp-section">
        <div className="lp-section-head">
          <span className="eyebrow">O que tem dentro</span>
          <h2 className="lp-h2">Tudo que vale a pena lembrar</h2>
        </div>
        <div className="lp-features">
          {FEATURES.map((f) => {
            const Ico = f.icon;
            return (
              <div key={f.titulo} className="card feature-card card-metal-edge">
                <div className="feature-ico">
                  <Ico size={20} />
                </div>
                <h4>{f.titulo}</h4>
                <p>{f.texto}</p>
              </div>
            );
          })}
          <Link href={enterHref} className="card feature-card feature-cta card-metal-edge">
            <div className="feature-orb">
              <MetalSphere size={48} />
            </div>
            <h4>Começar agora</h4>
            <p>Abra o álbum de vocês e veja o cronômetro correndo.</p>
          </Link>
        </div>
      </section>

      <footer className="lp-foot">
        <Logo size={30} />
        <span className="mono">feito para durar</span>
        <Link href={enterHref} className="btn btn-primary btn-sm">
          <Heart size={14} color="#fff" /> Entrar
        </Link>
      </footer>
    </div>
  );
}
