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
    texto: 'O tempo que passou desde que a gente virou nós.',
  },
  {
    icon: Images,
    titulo: 'Álbum',
    texto: 'Fotos pequenas, dias enormes, lembranças que ainda aquecem.',
  },
  {
    icon: GitCommitVertical,
    titulo: 'Linha do tempo',
    texto: 'Os dias que mudaram alguma coisa dentro da gente.',
  },
  {
    icon: Lock,
    titulo: 'Cápsula do tempo',
    texto: 'Cartas guardadas para quando o futuro chamar pelo nosso nome.',
  },
  {
    icon: MessageSquare,
    titulo: 'Mural de recados',
    texto: 'Bilhetes rápidos, do tipo que dá vontade de encontrar sem aviso.',
  },
];

export function Identity({ enterHref }: { enterHref: string }) {
  return (
    <div className="landing fade-in">
      <section className="lp-hero card-metal-edge">
        <MolecularField opacity={0.16} />
        <div className="lp-hero-inner">
          <span className="eyebrow">um lugar só nosso</span>
          <Logo size={104} className="lp-logo" />
          <p className="lp-tagline serif-note">Um canto quieto para guardar o que a gente vive.</p>
          <p className="page-sub lp-sub">
            Aqui ficam as fotos que ainda fazem a gente sorrir, os recados deixados no meio do dia,
            as datas que viraram lembrança e as cartas que a gente só quer abrir quando chegar a hora.
          </p>
          <div className="lp-actions">
            <Link href={enterHref} className="btn btn-primary lp-cta">
              <Heart size={17} color="#fff" /> Entrar no Everlong
            </Link>
            <a href="#recursos" className="btn btn-ghost lp-cta">
              Ver por dentro
            </a>
          </div>
        </div>
      </section>

      <section id="recursos" className="lp-section">
        <div className="lp-section-head">
          <span className="eyebrow">guardado com calma</span>
          <h2 className="lp-h2">As partes pequenas do nosso jeito</h2>
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
            <h4>Entrar no nosso canto</h4>
            <p>Abra as memórias e deixe o tempo continuar passando aqui dentro.</p>
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
