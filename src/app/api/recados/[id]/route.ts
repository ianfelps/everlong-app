import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { recados } from '@/server/db/schema';
import { errors, handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const patchSchema = z.object({
  conteudo: z.string().min(1).max(2000).optional(),
  cor: z.string().max(40).optional(),
  posicao_x: z.number().int().optional(),
  posicao_y: z.number().int().optional(),
  rotacao: z.number().int().min(-180).max(180).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());
    const patch: Record<string, unknown> = {};
    if (body.conteudo !== undefined) patch.conteudo = body.conteudo;
    if (body.cor !== undefined) patch.cor = body.cor;
    if (body.posicao_x !== undefined) patch.posicaoX = body.posicao_x;
    if (body.posicao_y !== undefined) patch.posicaoY = body.posicao_y;
    if (body.rotacao !== undefined) patch.rotacao = body.rotacao;

    const [row] = await db
      .update(recados)
      .set(patch)
      .where(eq(recados.id, id))
      .returning();
    if (!row) throw errors.notFound('recado não encontrado');
    return row;
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const deleted = await db
      .delete(recados)
      .where(eq(recados.id, id))
      .returning({ id: recados.id });
    if (deleted.length === 0) throw errors.notFound('recado não encontrado');
    return new NextResponse(null, { status: 204 });
  });
}
