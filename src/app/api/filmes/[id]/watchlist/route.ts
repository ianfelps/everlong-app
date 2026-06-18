import { NextRequest, NextResponse } from 'next/server';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { adicionarWatchlist, removerWatchlist } from '@/server/services/filmes';

export const runtime = 'nodejs';

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const session = await requireSession();
    const { id } = await params;
    const row = await adicionarWatchlist(id, session.perfilId);
    return NextResponse.json(row, { status: 200 });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    await removerWatchlist(id);
    return new NextResponse(null, { status: 204 });
  });
}
