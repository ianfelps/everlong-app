import { db } from '@/server/db';
import { perfis } from '@/server/db/schema';
import { handle } from '@/server/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  return handle(async () => {
    return db
      .select({
        id: perfis.id,
        nome: perfis.nome,
        avatarUrl: perfis.avatarUrl,
      })
      .from(perfis)
      .orderBy(perfis.nome);
  });
}
