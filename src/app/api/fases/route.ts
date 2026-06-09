import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { fases } from '@/server/db/schema';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const createSchema = z.object({
  nome: z.string().min(1).max(120),
  descricao: z.string().max(2000).optional(),
  data_inicio: z.string().date(),
  data_fim: z.string().date().nullable().optional(),
  ordem: z.number().int().nonnegative(),
});

export async function GET() {
  return handle(async () => {
    await requireSession();
    return db.select().from(fases).orderBy(asc(fases.ordem));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const body = createSchema.parse(await req.json());
    const [row] = await db
      .insert(fases)
      .values({
        nome: body.nome,
        descricao: body.descricao ?? null,
        dataInicio: body.data_inicio,
        dataFim: body.data_fim ?? null,
        ordem: body.ordem,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  });
}
