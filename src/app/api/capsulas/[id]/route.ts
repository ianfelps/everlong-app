import { NextRequest, NextResponse } from 'next/server';
import { errors, handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { obterCapsula, removerCapsula } from '@/server/services/capsulas';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const row = await obterCapsula(id);
    if (!row) throw errors.notFound('cápsula não encontrada');
    return {
      ...row,
      fotos: row.fotos.map((foto) => ({
        ...foto,
        tamanhoBytes: foto.tamanhoBytes.toString(),
      })),
    };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const ok = await removerCapsula(id);
    if (!ok) throw errors.notFound('cápsula não encontrada');
    return new NextResponse(null, { status: 204 });
  });
}
