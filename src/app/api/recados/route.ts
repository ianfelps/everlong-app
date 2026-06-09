import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { recados } from '@/server/db/schema';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const createSchema = z.object({
  conteudo: z.string().min(1).max(2000),
  cor: z.string().max(40).optional(),
  posicao_x: z.number().int().optional(),
  posicao_y: z.number().int().optional(),
  rotacao: z.number().int().min(-180).max(180).optional(),
});

export async function GET() {
  return handle(async () => {
    await requireSession();
    return db.select().from(recados).orderBy(desc(recados.createdAt));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireSession();
    const body = createSchema.parse(await req.json());
    const [row] = await db
      .insert(recados)
      .values({
        autorId: session.perfilId,
        conteudo: body.conteudo,
        cor: body.cor ?? 'amarelo',
        posicaoX: body.posicao_x ?? 0,
        posicaoY: body.posicao_y ?? 0,
        rotacao: body.rotacao ?? 0,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  });
}
