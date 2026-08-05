import { NextRequest, NextResponse } from 'next/server';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { curtirRecado, removerCurtidaDoRecado } from '@/server/queries';

export const runtime = 'nodejs';

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const session = await requireSession();
    const { id } = await params;
    await curtirRecado(id, session.perfilId);
    return new NextResponse(null, { status: 204 });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const session = await requireSession();
    const { id } = await params;
    await removerCurtidaDoRecado(id, session.perfilId);
    return new NextResponse(null, { status: 204 });
  });
}
