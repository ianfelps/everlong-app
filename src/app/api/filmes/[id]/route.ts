import { NextRequest, NextResponse } from 'next/server';
import { handle, errors } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { removerFilme } from '@/server/services/filmes';
import { obterFilmeComAgregados } from '@/server/queries';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const filme = await obterFilmeComAgregados(id);
    if (!filme) throw errors.notFound('filme não encontrado');
    return filme;
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const ok = await removerFilme(id);
    if (!ok) throw errors.notFound('filme não encontrado');
    return new NextResponse(null, { status: 204 });
  });
}
