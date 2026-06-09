import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { perfis } from '@/server/db/schema';
import { requireSession } from '@/server/lib/session';
import { errors, handle } from '@/server/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  return handle(async () => {
    const sess = await requireSession();
    const [perfil] = await db
      .select({
        id: perfis.id,
        nome: perfis.nome,
        avatarUrl: perfis.avatarUrl,
      })
      .from(perfis)
      .where(eq(perfis.id, sess.perfilId))
      .limit(1);
    if (!perfil) throw errors.unauthorized();
    return perfil;
  });
}
