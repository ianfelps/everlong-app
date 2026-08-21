import { sql } from 'drizzle-orm';
import { db } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: 'ok' });
  } catch {
    console.error('Health check failed');
    return Response.json({ status: 'unhealthy' }, { status: 503 });
  }
}
