import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/server/lib/session';
import { errors, handle } from '@/server/lib/http';
import {
  FotoLimits,
  criarFoto,
  listarFotos,
} from '@/server/services/fotos';

export const runtime = 'nodejs';
export const maxDuration = 60;

const metaSchema = z.object({
  legenda: z.string().max(500).optional(),
  tirada_em: z.string().datetime().optional(),
});

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  cursor: z.string().optional(),
});

function decodeCursor(raw: string): { uploadedAt: Date; id: string } {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as { u: string; i: string };
    return { uploadedAt: new Date(parsed.u), id: parsed.i };
  } catch {
    throw errors.badRequest('cursor inválido');
  }
}

function encodeCursor(c: { uploadedAt: Date; id: string }): string {
  return Buffer.from(
    JSON.stringify({ u: c.uploadedAt.toISOString(), i: c.id }),
  ).toString('base64url');
}

function serializeFoto<T extends { tamanhoBytes: bigint }>(row: T) {
  return { ...row, tamanhoBytes: row.tamanhoBytes.toString() };
}

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireSession();
    const url = new URL(req.url);
    const q = querySchema.parse(Object.fromEntries(url.searchParams));
    const { items, nextCursor } = await listarFotos({
      limit: q.limit,
      cursor: q.cursor ? decodeCursor(q.cursor) : undefined,
    });
    return {
      items: items.map(serializeFoto),
      next_cursor: nextCursor ? encodeCursor(nextCursor) : null,
    };
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireSession();
    const form = await req.formData();
    const file = form.get('arquivo');
    if (!(file instanceof File)) throw errors.badRequest('arquivo obrigatório');
    if (!FotoLimits.ALLOWED.has(file.type)) throw errors.unsupportedMedia();
    if (file.size > FotoLimits.MAX_BYTES) throw errors.tooLarge();

    const meta = metaSchema.parse({
      legenda: form.get('legenda') ?? undefined,
      tirada_em: form.get('tirada_em') ?? undefined,
    });

    const row = await criarFoto({
      file,
      autorId: session.perfilId,
      legenda: meta.legenda ?? null,
      tiradaEm: meta.tirada_em ? new Date(meta.tirada_em) : null,
    });

    return NextResponse.json(serializeFoto(row), { status: 201 });
  });
}
