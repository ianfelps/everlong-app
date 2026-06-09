import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/server/lib/session';
import { errors, handle } from '@/server/lib/http';
import {
  atualizarFoto,
  obterFoto,
  removerFoto,
} from '@/server/services/fotos';

export const runtime = 'nodejs';

const patchSchema = z.object({
  legenda: z.string().max(500).nullable().optional(),
  fase_id: z.string().uuid().nullable().optional(),
  tirada_em: z.string().datetime().nullable().optional(),
});

function serialize<T extends { tamanhoBytes: bigint }>(row: T) {
  return { ...row, tamanhoBytes: row.tamanhoBytes.toString() };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const foto = await obterFoto(id);
    if (!foto) throw errors.notFound('foto não encontrada');
    return serialize(foto);
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());
    const row = await atualizarFoto(id, {
      legenda: body.legenda,
      faseId: body.fase_id,
      tiradaEm:
        body.tirada_em === undefined
          ? undefined
          : body.tirada_em === null
            ? null
            : new Date(body.tirada_em),
    });
    if (!row) throw errors.notFound('foto não encontrada');
    return serialize(row);
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const ok = await removerFoto(id);
    if (!ok) throw errors.notFound('foto não encontrada');
    return new NextResponse(null, { status: 204 });
  });
}
