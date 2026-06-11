import { NextResponse } from 'next/server';
import { requireSession } from '@/server/lib/session';
import { handle } from '@/server/lib/http';
import { obterFotoAleatoria } from '@/server/services/fotos';

export const runtime = 'nodejs';

function serializeFoto(
  row: NonNullable<Awaited<ReturnType<typeof obterFotoAleatoria>>>,
) {
  return {
    id: row.id,
    legenda: row.legenda,
    tiradaEm: row.tiradaEm ? row.tiradaEm.toISOString() : null,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

export async function GET() {
  return handle(async () => {
    await requireSession();
    const foto = await obterFotoAleatoria();
    return NextResponse.json(foto ? serializeFoto(foto) : null);
  });
}
