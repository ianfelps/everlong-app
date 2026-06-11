import { listarEventos } from '@/server/queries';
import { listarFotosCronologicas } from '@/server/services/fotos';
import {
  TimelineItem,
  type TimelineEvent,
} from '@/components/timeline/TimelineItem';
import { MetalSphere } from '@/components/brand/MetalSphere';
import { EmptyState } from '@/components/ui/EmptyState';
import { TimelineAdd } from '@/components/timeline/TimelineAdd';

export const dynamic = 'force-dynamic';

const POEMA = 'tem dias que ficam morando na gente';

export default async function TimelinePage() {
  const [rows, fotosRows] = await Promise.all([
    listarEventos(),
    listarFotosCronologicas(),
  ]);
  const eventos: TimelineEvent[] = rows.map((e) => ({
    type: 'event',
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    dataEvento: e.dataEvento.toISOString(),
  }));
  const fotos: TimelineEvent[] = fotosRows.map((f) => ({
    type: 'photo',
    id: f.id,
    legenda: f.legenda,
    dataEvento: (f.tiradaEm ?? f.uploadedAt).toISOString(),
  }));
  const timeline = [...eventos, ...fotos].sort(
    (a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime(),
  );

  return (
    <div className="page shell fade-in">
      <div className="page-head" style={{ textAlign: 'center' }}>
        <span className="eyebrow">{POEMA}</span>
        <h1 className="page-title" style={{ marginTop: 10 }}>
          A linha do tempo
        </h1>
        <p className="page-sub" style={{ margin: '8px auto 0' }}>
          Os momentos que a gente gosta de voltar para visitar: um começo, uma viagem, uma frase,
          um dia que ficou diferente dos outros.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <TimelineAdd />
        </div>
      </div>

      {timeline.length === 0 ? (
        <EmptyState
          line={POEMA}
          title="Ainda não tem nenhum dia guardado aqui"
          hint="Use “Adicionar marco” para colocar o primeiro pedacinho da nossa história."
        />
      ) : (
        <div className="tl">
          <div className="tl-spine" />
          {timeline.map((ev, i) => (
            <TimelineItem
              key={ev.id}
              ev={ev}
              side={i % 2 === 0 ? 'right' : 'left'}
              index={i}
            />
          ))}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <p className="serif-note" style={{ color: 'var(--red)', fontSize: 22, marginTop: 6 }}>
              ... e a gente continua
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
