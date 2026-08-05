import { readSession } from '@/server/lib/session';
import { listarRecadosDoMural, mapaPerfis } from '@/server/queries';
import { Board } from '@/components/board/Board';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const session = await readSession();
  const [rows, perfilNome] = await Promise.all([
    session ? listarRecadosDoMural(session.perfilId) : [],
    mapaPerfis(),
  ]);

  const inicial = rows.map((r) => ({
    id: r.id,
    conteudo: r.conteudo,
    cor: r.cor,
    autorId: r.autorId,
    createdAt: r.createdAt.toISOString(),
    fixadoEm: r.fixadoEm?.toISOString() ?? null,
    lidoEm: r.lidoEm?.toISOString() ?? null,
    curtidas: r.curtidas,
    curtidoPorMim: r.curtidoPorMim,
  }));

  const perfis = Object.fromEntries(perfilNome);

  return <Board inicial={inicial} perfis={perfis} meuId={session?.perfilId ?? ''} />;
}
