import 'server-only';
import { asc, desc } from 'drizzle-orm';
import { db } from '@/server/db';
import { configCasal, eventos, perfis, recados } from '@/server/db/schema';

export async function mapaPerfis(): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: perfis.id, nome: perfis.nome })
    .from(perfis);
  return new Map(rows.map((r) => [r.id, r.nome]));
}

export async function nomesCasal(): Promise<string[]> {
  const rows = await db
    .select({ nome: perfis.nome })
    .from(perfis)
    .orderBy(asc(perfis.createdAt));
  return rows.map((r) => r.nome);
}

export async function obterCartaSecreta(): Promise<string | null> {
  const [row] = await db
    .select({ cartaSecreta: configCasal.cartaSecreta })
    .from(configCasal)
    .limit(1);
  return row?.cartaSecreta ?? null;
}

export async function listarRecados() {
  return db.select().from(recados).orderBy(desc(recados.createdAt));
}

export async function listarEventos() {
  return db.select().from(eventos).orderBy(asc(eventos.dataEvento));
}
