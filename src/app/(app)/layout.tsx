import { redirect } from 'next/navigation';
import { readSession } from '@/server/lib/session';
import { NavBar } from '@/components/nav/NavBar';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readSession();
  if (!session) redirect('/login');

  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
