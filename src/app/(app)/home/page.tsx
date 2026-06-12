import Link from 'next/link';
import { Heart, ChevronRight, Lock } from 'lucide-react';
import { calcularCronometro } from '@/server/services/cronometro';
import { listarFotos } from '@/server/services/fotos';
import { listarCapsulas } from '@/server/services/capsulas';
import {
  listarRecados,
  mapaPerfis,
  nomesCasal,
  obterCartaSecreta,
  obterSpotifyPlaylistId,
} from '@/server/queries';
import { DatingTimer } from '@/components/dashboard/DatingTimer';
import { SecretLetter } from '@/components/dashboard/SecretLetter';
import { MolecularField } from '@/components/brand/MolecularField';
import { PhotoImage } from '@/components/album/PhotoImage';
import { RandomPhotoButton } from '@/components/album/RandomPhotoButton';
import { hexDaCor } from '@/lib/colors';
import { dataExtenso, tempoAte, tempoRelativo } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [
    cron,
    nomes,
    fotosRes,
    recadosTodos,
    capsulas,
    perfilNome,
    secretLetter,
    spotifyPlaylistId,
  ] =
    await Promise.all([
      calcularCronometro(),
      nomesCasal(),
      listarFotos({ limit: 6 }),
      listarRecados(),
      listarCapsulas(),
      mapaPerfis(),
      obterCartaSecreta(),
      obterSpotifyPlaylistId(),
    ]);

  const recados = recadosTodos.slice(0, 3);
  const proxima = capsulas
    .filter((c) => c.dataDesbloqueio > new Date())
    .sort((a, b) => a.dataDesbloqueio.getTime() - b.dataDesbloqueio.getTime())[0];
  const tempoProximaCapsula = proxima ? tempoAte(proxima.dataDesbloqueio) : null;

  const [a, b] = nomes;

  return (
    <div className="page shell fade-in">
      <section className="hero card-metal-edge">
        <MolecularField
          opacity={0.1}
          style={{ maskImage: 'linear-gradient(90deg,transparent,#000 60%)' }}
        />
        <div className="hero-grid">
          <span className="eyebrow">Nosso tempo juntos</span>
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
              dias desde que a gente começou a contar junto.
            </span>
          </div>
        </div>
      </section>

      {spotifyPlaylistId && (
        <section className="spotify-card card-metal-edge">
          <div className="section-h">
            <h3>Nossa playlist</h3>
          </div>
          <iframe
            title="Playlist do casal no Spotify"
            className="spotify-iframe"
            src={`https://open.spotify.com/embed/playlist/${encodeURIComponent(
              spotifyPlaylistId,
            )}?utm_source=generator&theme=0&si=240917446531463c`}
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture;"
            loading="lazy"
          />
        </section>
      )}

      <div className="dash-cols">
        <div>
          <div className="section-h">
            <h3>Fotos recentes</h3>
            <div className="section-actions">
              <RandomPhotoButton className="link-more random-link" />
              <Link className="link-more" href="/album">
                Ver álbum <ChevronRight size={15} />
              </Link>
            </div>
          </div>
          {fotosRes.items.length > 0 ? (
            <div className="mini-gallery">
              {fotosRes.items.map((p, index) => (
                <Link key={p.id} href="/album" className="mini-photo">
                  <PhotoImage
                    id={p.id}
                    legenda={p.legenda}
                    priority={index < 3}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
              nenhuma foto ainda — coloca aqui um dia que vale voltar.
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
                o mural ainda está esperando o primeiro bilhete.
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
                    · {tempoProximaCapsula?.valor} {tempoProximaCapsula?.unidade}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <p className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
              nenhuma carta guardada para depois.
            </p>
          )}
        </div>
      </div>

      <SecretLetter destinataria={b ?? 'meu amor'} letter={secretLetter} />
    </div>
  );
}
