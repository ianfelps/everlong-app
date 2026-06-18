import { NextRequest, NextResponse } from 'next/server';
import { handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { desmarcarAssistidoJunto } from '@/server/services/filmes';

export const runtime = 'nodejs';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ filmeId: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { filmeId } = await params;
    await desmarcarAssistidoJunto(filmeId);
    return new NextResponse(null, { status: 204 });
  });
}
