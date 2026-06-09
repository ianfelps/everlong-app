import { handle } from '@/server/lib/http';
import { calcularCronometro } from '@/server/services/cronometro';

export const runtime = 'nodejs';
export const revalidate = 0; // sempre fresh

export async function GET() {
  return handle(async () => calcularCronometro());
}
