import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { fases } from '@/server/db/schema';
import { errors, handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const patchSchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  descricao: z.string().max(2000).nullable().optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().nullable().optional(),
  ordem: z.number().int().nonnegative().optional(),
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
    if (body.nome !== undefined) patch.nome = body.nome;
    if (body.descricao !== undefined) patch.descricao = body.descricao;
    if (body.data_inicio !== undefined) patch.dataInicio = body.data_inicio;
    if (body.data_fim !== undefined) patch.dataFim = body.data_fim;
    if (body.ordem !== undefined) patch.ordem = body.ordem;

    const [row] = await db
      .update(fases)
      .set(patch)
      .where(eq(fases.id, id))
      .returning();
    if (!row) throw errors.notFound('fase não encontrada');
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
    const deleted = await db.delete(fases).where(eq(fases.id, id)).returning();
    if (deleted.length === 0) throw errors.notFound('fase não encontrada');
    return new NextResponse(null, { status: 204 });
  });
}
