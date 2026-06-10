import { readSession } from '@/server/lib/session';
import { Identity } from '@/components/identity/Identity';

export const dynamic = 'force-dynamic';

export default async function IdentityPage() {
  const session = await readSession();
  return <Identity enterHref={session ? '/home' : '/login'} />;
}
