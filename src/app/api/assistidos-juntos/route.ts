import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { marcarAssistidoJunto } from '@/server/services/filmes';
import { listarAssistidosJuntos } from '@/server/queries';

export const runtime = 'nodejs';

const createSchema = z.object({
  filme_id: z.string().uuid(),
  data_assistido: z.string().datetime().nullish(),
});

export async function GET() {
  return handle(async () => {
    await requireSession();
    return listarAssistidosJuntos();
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const body = createSchema.parse(await req.json());
    const row = await marcarAssistidoJunto(
      body.filme_id,
      body.data_assistido ? new Date(body.data_assistido) : null,
    );
    return NextResponse.json(row, { status: 201 });
  });
}
