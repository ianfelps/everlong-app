import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
const INIT_MIGRATION_CREATED_AT = 1700000000000;
const INIT_MIGRATION_PATH = resolve(process.cwd(), 'drizzle/migrations/0000_init.sql');

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL nao definido');
}

if (!existsSync(INIT_MIGRATION_PATH)) {
  throw new Error(`Migration inicial nao encontrada: ${INIT_MIGRATION_PATH}`);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function main() {
  try {
    const configRows = await sql<{ table_name: string | null }[]>`
      select to_regclass('public.config_casal')::text as table_name
    `;
    const configCasalTable = configRows[0]?.table_name ?? null;

    if (!configCasalTable) {
      throw new Error(
        'A tabela public.config_casal nao existe. Use pnpm db:migrate em banco vazio; baseline e apenas para bancos que ja receberam a 0000_init.sql.',
      );
    }

    const migrationSql = readFileSync(INIT_MIGRATION_PATH, 'utf8');
    const migrationHash = createHash('sha256').update(migrationSql).digest('hex');

    await sql`create schema if not exists drizzle`;
    await sql`
      create table if not exists drizzle.__drizzle_migrations (
        id serial primary key,
        hash text not null,
        created_at bigint
      )
    `;

    const existing = await sql<{ id: number }[]>`
      select id
      from drizzle.__drizzle_migrations
      where created_at = ${INIT_MIGRATION_CREATED_AT}
      limit 1
    `;

    if (existing.length > 0) {
      console.log('Baseline ja registrado para 0000_init.');
    } else {
      await sql`
        insert into drizzle.__drizzle_migrations (hash, created_at)
        values (${migrationHash}, ${INIT_MIGRATION_CREATED_AT})
      `;
      console.log('Baseline registrado para 0000_init.');
    }
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
