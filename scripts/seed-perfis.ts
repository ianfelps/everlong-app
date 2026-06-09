// Roda com: pnpm seed -- "Pessoa A" "senha A" "Pessoa B" "senha B" "2020-01-01T00:00:00Z" "<drive_folder_id>"
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import argon2 from 'argon2';
import { sql } from 'drizzle-orm';
import { perfis, configCasal } from '../src/server/db/schema';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 6) {
    console.error(
      'uso: seed-perfis.ts <nomeA> <senhaA> <nomeB> <senhaB> <data_inicio_iso> <drive_folder_id>',
    );
    process.exit(1);
  }
  const [nomeA, senhaA, nomeB, senhaB, dataInicioIso, driveFolderId] = args as [
    string, string, string, string, string, string,
  ];

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não definido');

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  const hashA = await argon2.hash(senhaA, { type: argon2.argon2id });
  const hashB = await argon2.hash(senhaB, { type: argon2.argon2id });

  await db
    .insert(perfis)
    .values([
      { nome: nomeA, senhaHash: hashA },
      { nome: nomeB, senhaHash: hashB },
    ])
    .onConflictDoUpdate({
      target: perfis.nome,
      set: { senhaHash: sql`excluded.senha_hash` },
    });

  await db
    .insert(configCasal)
    .values({
      id: true,
      dataInicio: new Date(dataInicioIso),
      driveFolderId,
    })
    .onConflictDoUpdate({
      target: configCasal.id,
      set: {
        dataInicio: sql`excluded.data_inicio`,
        driveFolderId: sql`excluded.drive_folder_id`,
      },
    });

  console.log('seed ok');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
