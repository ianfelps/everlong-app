import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { perfis } from '@/server/db/schema';
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  assinarSessao,
  verificarSenha,
} from '@/server/services/auth';
import { errors, handle } from '@/server/lib/http';

export const runtime = 'nodejs';

const bodySchema = z.object({
  perfil_id: z.string().uuid(),
  senha: z.string().min(1).max(256),
});

// Anti brute-force in-memory simples (por perfil)
const tentativas = new Map<string, { count: number; until: number }>();
const LIMITE = 5;
const BLOQUEIO_MS = 60_000;

function bloqueado(perfilId: string): boolean {
  const t = tentativas.get(perfilId);
  if (!t) return false;
  if (Date.now() > t.until) {
    tentativas.delete(perfilId);
    return false;
  }
  return t.count >= LIMITE;
}

function registrarFalha(perfilId: string): void {
  const agora = Date.now();
  const atual = tentativas.get(perfilId);
  if (!atual || agora > atual.until) {
    tentativas.set(perfilId, { count: 1, until: agora + BLOQUEIO_MS });
    return;
  }
  atual.count += 1;
  atual.until = agora + BLOQUEIO_MS;
}

export async function POST(req: Request) {
  return handle(async () => {
    const body = bodySchema.parse(await req.json());

    if (bloqueado(body.perfil_id)) {
      throw errors.forbidden('muitas tentativas — aguarde 1 minuto');
    }

    const [perfil] = await db
      .select()
      .from(perfis)
      .where(eq(perfis.id, body.perfil_id))
      .limit(1);

    if (!perfil) {
      registrarFalha(body.perfil_id);
      throw errors.unauthorized('credenciais inválidas');
    }

    const ok = await verificarSenha(body.senha, perfil.senhaHash);
    if (!ok) {
      registrarFalha(body.perfil_id);
      throw errors.unauthorized('credenciais inválidas');
    }

    tentativas.delete(body.perfil_id);

    const token = await assinarSessao({
      perfilId: perfil.id,
      nome: perfil.nome,
    });

    const res = new NextResponse(null, { status: 204 });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  });
}
