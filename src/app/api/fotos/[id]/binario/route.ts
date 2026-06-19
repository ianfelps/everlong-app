import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { requireSession } from '@/server/lib/session';
import { errors, handle } from '@/server/lib/http';
import { obterFoto } from '@/server/services/fotos';
import { streamFoto } from '@/server/services/drive';

export const runtime = 'nodejs';
export const maxDuration = 60;

function extensaoPorMime(mimeType: string): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/heic') return 'heic';
  return 'jpg';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireSession();
    const { id } = await params;
    const foto = await obterFoto(id);
    const download = new URL(req.url).searchParams.get('download') === '1';
    if (!foto) throw errors.notFound('foto não encontrada');

    const driveRes = await streamFoto(foto.driveFileId);
    const nodeStream = driveRes.data as Readable;

    // Converte stream Node em ReadableStream Web p/ Response do Next
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;
    const headers: Record<string, string> = {
      'content-type': foto.mimeType,
      'cache-control': 'private, max-age=3600, immutable',
    };

    if (download) {
      const filename = `everlong-foto-${foto.id}.${extensaoPorMime(foto.mimeType)}`;
      headers['content-disposition'] = `attachment; filename="${filename}"`;
    }

    return new Response(webStream, {
      status: 200,
      headers,
    });
  });
}
