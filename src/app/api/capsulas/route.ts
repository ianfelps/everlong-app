import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { errors, handle } from '@/server/lib/http';
import { requireSession } from '@/server/lib/session';
import { criarCapsula, listarCapsulas } from '@/server/services/capsulas';
import { FotoLimits } from '@/server/services/fotos';

export const runtime = 'nodejs';

const MAX_CAPSULA_FOTOS = 10;

const createSchema = z.object({
  titulo: z.string().min(1).max(200),
  conteudo: z.string().min(1).max(50_000),
  data_desbloqueio: z.string().datetime(),
});

export async function GET() {
  return handle(async () => {
    await requireSession();
    return listarCapsulas();
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireSession();
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const fotos = form.getAll('fotos');
      const files = fotos.filter((item): item is File => item instanceof File && item.size > 0);
      if (files.length > MAX_CAPSULA_FOTOS) {
        throw errors.badRequest(`limite de ${MAX_CAPSULA_FOTOS} fotos por cápsula excedido`);
      }

      for (const file of files) {
        if (!FotoLimits.ALLOWED.has(file.type)) throw errors.unsupportedMedia();
        if (file.size > FotoLimits.MAX_BYTES) throw errors.tooLarge();
      }

      const body = createSchema.parse({
        titulo: form.get('titulo'),
        conteudo: form.get('conteudo'),
        data_desbloqueio: form.get('data_desbloqueio'),
      });

      const row = await criarCapsula({
        autorId: session.perfilId,
        titulo: body.titulo,
        conteudo: body.conteudo,
        dataDesbloqueio: new Date(body.data_desbloqueio),
        fotos: files,
      });

      return NextResponse.json(row, { status: 201 });
    }

    const body = createSchema.parse(await req.json());
    const row = await criarCapsula({
      autorId: session.perfilId,
      titulo: body.titulo,
      conteudo: body.conteudo,
      dataDesbloqueio: new Date(body.data_desbloqueio),
    });
    return NextResponse.json(row, { status: 201 });
  });
}
