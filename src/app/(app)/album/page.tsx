import { listarFotosPorDataTirada } from '@/server/services/fotos';
import { AlbumGrid } from '@/components/album/AlbumGrid';
import type { FotoItem } from '@/components/album/types';

export const dynamic = 'force-dynamic';

export default async function AlbumPage() {
  const items = await listarFotosPorDataTirada();
  const fotos: FotoItem[] = items.map((f) => ({
    id: f.id,
    legenda: f.legenda,
    tiradaEm: f.tiradaEm ? f.tiradaEm.toISOString() : null,
    uploadedAt: f.uploadedAt.toISOString(),
    largura: f.largura,
    altura: f.altura,
  }));
  return <AlbumGrid fotos={fotos} />;
}
