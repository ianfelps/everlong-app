import { openapiSpec } from '@/server/lib/openapi';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

export async function GET() {
  return Response.json(openapiSpec);
}
