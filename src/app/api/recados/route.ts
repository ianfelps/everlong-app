import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db';
import { recados } from '@/server/db/schema';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { listarRecados } from '@/server/queries';

export const runtime = 'nodejs';

const createSchema = z.object({
  conteudo: z.string().min(1).max(2000),
  cor: z.string().max(40).optional(),
});

const querySchema = z.object({
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const url = new URL(req.url);
    const q = querySchema.parse(Object.fromEntries(url.searchParams));
    return listarRecados(q.order);
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
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  });
}
