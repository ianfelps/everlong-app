import { FilmesView } from '@/components/filmes/FilmesView';
import type { FilmeResumo } from '@/components/filmes/types';
import { readSession } from '@/server/lib/session';
import { listarCatalogoComResumo, mapaPerfis } from '@/server/queries';

export const dynamic = 'force-dynamic';

export default async function FilmesPage() {
  const [catalogo, perfis, session] = await Promise.all([
    listarCatalogoComResumo(),
    mapaPerfis(),
    readSession(),
  ]);

  const filmes: FilmeResumo[] = catalogo.map((f) => ({
    id: f.id,
    tmdbId: f.tmdbId,
    titulo: f.titulo,
    posterPath: f.posterPath,
    ano: f.ano,
    sinopse: f.sinopse,
    avaliacoes: f.avaliacoes.map((a) => ({
      id: a.id,
      autorId: a.autorId,
      nota: a.nota,
      texto: a.texto,
      updatedAt: a.updatedAt.toISOString(),
    })),
    favoritos: f.favoritos.map((fav) => ({ autorId: fav.autorId })),
    naWatchlist: f.naWatchlist,
    assistidoJunto: f.assistidoJunto
      ? {
          dataAssistido: f.assistidoJunto.dataAssistido
            ? f.assistidoJunto.dataAssistido.toISOString()
            : null,
          createdAt: f.assistidoJunto.createdAt.toISOString(),
        }
      : null,
  }));

  return (
    <FilmesView
      filmes={filmes}
      perfis={Object.fromEntries(perfis)}
      meuId={session?.perfilId ?? ''}
    />
  );
}
