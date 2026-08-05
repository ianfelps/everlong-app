import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { marcarRecadosComoLidos } from '@/server/queries';

export const runtime = 'nodejs';

const schema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireSession();
    const { ids } = schema.parse(await req.json());
    return { ids: await marcarRecadosComoLidos(ids, session.perfilId) };
  });
}
