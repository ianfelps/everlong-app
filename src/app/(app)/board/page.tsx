import { readSession } from '@/server/lib/session';
import { listarRecados, mapaPerfis } from '@/server/queries';
import { Board } from '@/components/board/Board';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const [session, rows, perfilNome] = await Promise.all([
    readSession(),
    listarRecados(),
    mapaPerfis(),
  ]);

  const inicial = rows.map((r) => ({
    id: r.id,
    conteudo: r.conteudo,
    cor: r.cor,
    autorId: r.autorId,
    createdAt: r.createdAt.toISOString(),
  }));

  const perfis = Object.fromEntries(perfilNome);

  return <Board inicial={inicial} perfis={perfis} meuId={session?.perfilId ?? ''} />;
}
