import 'server-only';
import argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/env';

const ARGON_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19 * 1024,
  timeCost: 2,
  parallelism: 1,
};

export const SESSION_COOKIE = 'evl_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dias

let secretKey: Uint8Array | null = null;
function getKey(): Uint8Array {
  if (!secretKey) secretKey = new TextEncoder().encode(env.SESSION_SECRET);
  return secretKey;
}

export type SessionPayload = {
  perfilId: string;
  nome: string;
};

export async function hashSenha(senha: string): Promise<string> {
  return argon2.hash(senha, ARGON_OPTS);
}

export async function verificarSenha(
  senha: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, senha);
  } catch {
    return false;
  }
}

export async function assinarSessao(payload: SessionPayload): Promise<string> {
  return new SignJWT({ perfilId: payload.perfilId, nome: payload.nome })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getKey());
}

export async function verificarSessao(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (
      typeof payload.perfilId !== 'string' ||
      typeof payload.nome !== 'string'
    ) {
      return null;
    }
    return { perfilId: payload.perfilId, nome: payload.nome };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
