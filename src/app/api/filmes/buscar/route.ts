import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { buscarFilmes } from '@/server/services/tmdb';

export const runtime = 'nodejs';

const querySchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const url = new URL(req.url);
    const q = querySchema.parse(Object.fromEntries(url.searchParams));
    return buscarFilmes(q.q, q.page);
  });
}
