import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db';
import { recados } from '@/server/db/schema';
import { errors, handle } from '@/server/lib/http';
import {
  listarArquivoRecados,
  listarRecadosDoMural,
} from '@/server/queries';
import { requireSession } from '@/server/lib/session';

export const runtime = 'nodejs';

const createSchema = z.object({
  conteudo: z.string().min(1).max(2000),
  cor: z.string().max(40).optional(),
});

const querySchema = z.object({
  scope: z.enum(['current', 'archive']).default('current'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

function decodeCursor(raw: string): { createdAt: Date; id: string } {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as { c: string; i: string };
    const createdAt = new Date(parsed.c);
    if (Number.isNaN(createdAt.getTime()) || !parsed.i) throw new Error();
    return { createdAt, id: parsed.i };
  } catch {
    throw errors.badRequest('cursor inválido');
  }
}

function encodeCursor(cursor: { createdAt: Date; id: string }): string {
  return Buffer.from(
    JSON.stringify({ c: cursor.createdAt.toISOString(), i: cursor.id }),
  ).toString('base64url');
}

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireSession();
    const url = new URL(req.url);
    const q = querySchema.parse(Object.fromEntries(url.searchParams));
    if (q.scope === 'archive') {
      const { items, nextCursor } = await listarArquivoRecados(session.perfilId, {
        limit: q.limit,
        cursor: q.cursor ? decodeCursor(q.cursor) : undefined,
      });
      return {
        items,
        next_cursor: nextCursor ? encodeCursor(nextCursor) : null,
      };
    }
    return listarRecadosDoMural(session.perfilId);
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
    return NextResponse.json(
      { ...row, curtidas: 0, curtidoPorMim: false },
      { status: 201 },
    );
  });
}
