import { NextRequest, NextResponse } from 'next/server';
import { asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { eventos } from '@/server/db/schema';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const querySchema = z.object({
  ordem: z.enum(['asc', 'desc']).default('desc'),
});

const createSchema = z.object({
  titulo: z.string().min(1).max(200),
  descricao: z.string().max(5000).optional(),
  data_evento: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const url = new URL(req.url);
    const q = querySchema.parse(Object.fromEntries(url.searchParams));
    return db
      .select()
      .from(eventos)
      .orderBy(q.ordem === 'asc' ? asc(eventos.dataEvento) : desc(eventos.dataEvento));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const body = createSchema.parse(await req.json());
    const [row] = await db
      .insert(eventos)
      .values({
        titulo: body.titulo,
        descricao: body.descricao ?? null,
        dataEvento: new Date(body.data_evento),
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  });
}
