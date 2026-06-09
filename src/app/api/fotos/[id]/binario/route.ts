import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { requireSession } from '@/server/lib/session';
import { errors, handle } from '@/server/lib/http';
import { obterFoto } from '@/server/services/fotos';
import { streamFoto } from '@/server/services/drive';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const foto = await obterFoto(id);
    if (!foto) throw errors.notFound('foto não encontrada');

    const driveRes = await streamFoto(foto.driveFileId);
    const nodeStream = driveRes.data as Readable;

    // Converte stream Node em ReadableStream Web p/ Response do Next
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new Response(webStream, {
      status: 200,
      headers: {
        'content-type': foto.mimeType,
        'cache-control': 'private, max-age=3600, immutable',
      },
    });
  });
}
