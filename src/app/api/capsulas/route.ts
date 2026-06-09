import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { criarCapsula, listarCapsulas } from '@/server/services/capsulas';

export const runtime = 'nodejs';

const createSchema = z.object({
  titulo: z.string().min(1).max(200),
  conteudo: z.string().min(1).max(50_000),
  data_desbloqueio: z.string().datetime(),
  destinatario_id: z.string().uuid().nullable().optional(),
});

export async function GET() {
  return handle(async () => {
    await requireSession();
    return listarCapsulas();
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireSession();
    const body = createSchema.parse(await req.json());
    const row = await criarCapsula({
      autorId: session.perfilId,
      destinatarioId: body.destinatario_id ?? null,
      titulo: body.titulo,
      conteudo: body.conteudo,
      dataDesbloqueio: new Date(body.data_desbloqueio),
    });
    return NextResponse.json(row, { status: 201 });
  });
}
