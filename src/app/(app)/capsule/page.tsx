import { listarCapsulas } from '@/server/services/capsulas';
import { mapaPerfis } from '@/server/queries';
import { CapsuleGrid } from '@/components/capsule/CapsuleGrid';
import type { CapItem } from '@/components/capsule/types';

export const dynamic = 'force-dynamic';

const POEMA = 'algumas palavras pedem para esperar o tempo certo';

export default async function CapsulePage() {
  const [rows, perfilNome] = await Promise.all([listarCapsulas(), mapaPerfis()]);
  const caps: CapItem[] = rows
    .slice()
    .sort((a, b) => a.dataDesbloqueio.getTime() - b.dataDesbloqueio.getTime())
    .map((c) => ({
      id: c.id,
      titulo: c.titulo,
      from: perfilNome.get(c.autorId) ?? 'os dois',
      dataDesbloqueio: c.dataDesbloqueio.toISOString(),
      aberta: c.abertaEm != null,
    }));

  return (
    <div className="page shell fade-in">
      <div className="page-head">
        <h1 className="page-title">Cápsula do tempo</h1>
        <p className="page-sub">
          {POEMA}. Mensagens que vocês escreveram para abrir só quando chegar a hora.
        </p>
      </div>
      <CapsuleGrid caps={caps} />
    </div>
  );
}
