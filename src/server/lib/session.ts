import 'server-only';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE,
  verificarSessao,
  type SessionPayload,
} from '@/server/services/auth';
import { errors } from './http';

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verificarSessao(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const sess = await readSession();
  if (!sess) throw errors.unauthorized();
  return sess;
}
