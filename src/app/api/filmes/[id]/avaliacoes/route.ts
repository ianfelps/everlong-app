import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import {
  removerAvaliacaoPropria,
  upsertAvaliacao,
} from '@/server/services/filmes';

export const runtime = 'nodejs';

const putSchema = z.object({
  nota: z.number().int().min(1).max(5),
  texto: z.string().max(5000).nullish(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const session = await requireSession();
    const { id } = await params;
    const body = putSchema.parse(await req.json());
    const row = await upsertAvaliacao({
      filmeId: id,
      autorId: session.perfilId,
      nota: body.nota,
      texto: body.texto ?? null,
    });
    return NextResponse.json(row, { status: 200 });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const session = await requireSession();
    const { id } = await params;
    await removerAvaliacaoPropria(id, session.perfilId);
    return new NextResponse(null, { status: 204 });
  });
}
