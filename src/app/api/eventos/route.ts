import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { eventos } from '@/server/db/schema';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const querySchema = z.object({
  fase_id: z.string().uuid().optional(),
  ordem: z.enum(['asc', 'desc']).default('desc'),
});

const createSchema = z.object({
  titulo: z.string().min(1).max(200),
  descricao: z.string().max(5000).optional(),
  data_evento: z.string().datetime(),
  icone: z.string().max(40).optional(),
  fase_id: z.string().uuid().nullable().optional(),
  foto_id: z.string().uuid().nullable().optional(),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const url = new URL(req.url);
    const q = querySchema.parse(Object.fromEntries(url.searchParams));
    const where = q.fase_id ? eq(eventos.faseId, q.fase_id) : undefined;
    return db
      .select()
      .from(eventos)
      .where(where ? and(where) : undefined)
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
        icone: body.icone ?? null,
        faseId: body.fase_id ?? null,
        fotoId: body.foto_id ?? null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  });
}
