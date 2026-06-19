import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { detalharFilme } from '@/server/services/tmdb';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { tmdbId } = await params;
    const id = z.coerce.number().int().positive().parse(tmdbId);
    return detalharFilme(id);
  });
}
