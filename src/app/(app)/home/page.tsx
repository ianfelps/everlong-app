import Link from 'next/link';
import { Heart, ChevronRight, Lock } from 'lucide-react';
import { calcularCronometro } from '@/server/services/cronometro';
import { listarFotos } from '@/server/services/fotos';
import { listarCapsulas } from '@/server/services/capsulas';
import { listarRecados, mapaPerfis, nomesCasal } from '@/server/queries';
import { DatingTimer } from '@/components/dashboard/DatingTimer';
import { MolecularField } from '@/components/brand/MolecularField';
import { PhotoImage } from '@/components/album/PhotoImage';
import { hexDaCor } from '@/lib/colors';
import { dataExtenso, diasAte, tempoRelativo } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [cron, nomes, fotosRes, recadosTodos, capsulas, perfilNome] =
    await Promise.all([
      calcularCronometro(),
      nomesCasal(),
      listarFotos({ limit: 6 }),
      listarRecados(),
      listarCapsulas(),
      mapaPerfis(),
    ]);

  const recados = recadosTodos.slice(0, 3);
  const proxima = capsulas
    .filter((c) => c.dataDesbloqueio > new Date())
    .sort((a, b) => a.dataDesbloqueio.getTime() - b.dataDesbloqueio.getTime())[0];

  const [a, b] = nomes;

  return (
    <div className="page shell fade-in">
      <section className="hero card-metal-edge">
        <MolecularField
          opacity={0.1}
          style={{ maskImage: 'linear-gradient(90deg,transparent,#000 60%)' }}
        />
        <div className="hero-grid">
          <span className="eyebrow">Cronômetro de namoro</span>
          <p className="hero-names">
            {a && b ? (
              <>
                <b>{a}</b> &amp; <b>{b}</b>
              </>
            ) : (
              <b>Nosso tempo juntos</b>
            )}{' '}
            — desde {dataExtenso(cron.data_inicio)}
          </p>
          <DatingTimer dataInicio={cron.data_inicio} />
          <div className="timer-foot">
            <Heart size={15} fill="var(--red)" color="var(--red)" />
            <span>
              São{' '}
              <b style={{ color: '#fff' }}>
                {cron.total_dias.toLocaleString('pt-BR')}
              </b>{' '}
              dias girando na mesma órbita.
            </span>
          </div>
        </div>
      </section>

      <div className="dash-cols">
        <div>
          <div className="section-h">
            <h3>Fotos recentes</h3>
            <Link className="link-more" href="/album">
              Ver álbum <ChevronRight size={15} />
            </Link>
          </div>
          {fotosRes.items.length > 0 ? (
            <div className="mini-gallery">
              {fotosRes.items.map((p) => (
                <Link key={p.id} href="/album" className="mini-photo">
                  <PhotoImage
                    id={p.id}
                    legenda={p.legenda}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
              nenhuma foto ainda — comece o álbum de vocês.
            </p>
          )}
        </div>

        <div>
          <div className="section-h">
            <h3>Últimos recados</h3>
            <Link className="link-more" href="/board">
              Ver mural <ChevronRight size={15} />
            </Link>
          </div>
          <div className="dash-notes">
            {recados.map((r) => (
              <div key={r.id} className="note-row">
                <span className="note-chip" style={{ background: hexDaCor(r.cor) }} />
                <div>
                  <p>{r.conteudo}</p>
                  <div className="note-meta">
                    <span>{perfilNome.get(r.autorId) ?? '—'}</span>
                    <span>· {tempoRelativo(r.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            {recados.length === 0 && (
              <p className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                o mural ainda está vazio.
              </p>
            )}
          </div>

          <div className="section-h" style={{ marginTop: 24 }}>
            <h3>Próxima cápsula</h3>
            <Link className="link-more" href="/capsule">
              Abrir <ChevronRight size={15} />
            </Link>
          </div>
          {proxima ? (
            <Link
              href="/capsule"
              className="note-row"
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <div
                className="cap-padlock"
                style={{ width: 42, height: 42, borderRadius: 11 }}
              >
                <Lock size={18} />
              </div>
              <div>
                <p style={{ color: 'var(--metal-head)' }}>{proxima.titulo}</p>
                <div className="note-meta">
                  <span>desbloqueia em</span>
                  <span style={{ color: 'var(--red)' }}>
                    · {diasAte(proxima.dataDesbloqueio)} dias
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <p className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
              nenhuma cápsula selada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
