import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { eventos } from '@/server/db/schema';
import { errors, handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const patchSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descricao: z.string().max(5000).nullable().optional(),
  data_evento: z.string().datetime().optional(),
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
    if (body.titulo !== undefined) patch.titulo = body.titulo;
    if (body.descricao !== undefined) patch.descricao = body.descricao;
    if (body.data_evento !== undefined)
      patch.dataEvento = new Date(body.data_evento);

    const [row] = await db
      .update(eventos)
      .set(patch)
      .where(eq(eventos.id, id))
      .returning();
    if (!row) throw errors.notFound('evento não encontrado');
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
      .delete(eventos)
      .where(eq(eventos.id, id))
      .returning();
    if (deleted.length === 0) throw errors.notFound('evento não encontrado');
    return new NextResponse(null, { status: 204 });
  });
}
