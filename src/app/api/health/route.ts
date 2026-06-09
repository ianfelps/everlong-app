import { sql } from 'drizzle-orm';
import { db } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STARTED_AT = Date.now();

export async function GET() {
  const checks: Record<string, { ok: boolean; latency_ms?: number; error?: string }> = {};

  const t0 = Date.now();
  try {
    await db.execute(sql`select 1`);
    checks.database = { ok: true, latency_ms: Date.now() - t0 };
  } catch (err) {
    checks.database = {
      ok: false,
      latency_ms: Date.now() - t0,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return Response.json(
    {
      status: allOk ? 'ok' : 'degraded',
      uptime_seconds: Math.floor((Date.now() - STARTED_AT) / 1000),
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
