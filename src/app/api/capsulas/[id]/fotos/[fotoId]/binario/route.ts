import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { requireSession } from '@/server/lib/session';
import { errors, handle } from '@/server/lib/http';
import { obterFotoCapsula } from '@/server/services/capsulas';
import { streamFoto } from '@/server/services/drive';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fotoId: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id, fotoId } = await params;
    const foto = await obterFotoCapsula(id, fotoId);
    if (!foto) throw errors.notFound('foto não encontrada');

    const driveRes = await streamFoto(foto.driveFileId);
    const nodeStream = driveRes.data as Readable;
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
