import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { adicionarFilmeAoCatalogo } from '@/server/services/filmes';
import { listarCatalogo } from '@/server/queries';

export const runtime = 'nodejs';

const createSchema = z.object({
  tmdb_id: z.number().int().positive(),
});

export async function GET() {
  return handle(async () => {
    await requireSession();
    return listarCatalogo();
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireSession();
    const body = createSchema.parse(await req.json());
    const row = await adicionarFilmeAoCatalogo(body.tmdb_id, session.perfilId);
    return NextResponse.json(row, { status: 201 });
  });
}
