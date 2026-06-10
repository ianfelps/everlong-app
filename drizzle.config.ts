import { defineConfig } from 'drizzle-kit';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function carregarEnvLocal(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;

    const key = match[1]!;
    const rawValue = match[2]!;
    if (process.env[key] !== undefined) continue;

    let value = rawValue.trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

carregarEnvLocal('.env.local');
carregarEnvLocal('.env');

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL não definido');

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
