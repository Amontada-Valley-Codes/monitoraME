import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminDemoBanner, AdminSessionProvider } from '../admin-session';
import { getAdminAccess } from './admin-access';

/** Lê a sessão no servidor, dentro de um Suspense, e só renderiza o painel para Admin e Monitor. */
export async function AdminGate({ children }: { children: ReactNode }) {
  const access = await getAdminAccess();

  if (access.status === 'unauthenticated') redirect('/login?returnTo=/admin');

  if (access.status === 'forbidden') {
    return (
      <>
        {access.demo && <AdminDemoBanner profile="company" />}
        <section role="alert" className="mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 rounded-xl border bg-card p-10 text-center">
          <ShieldAlert className="size-8 text-destructive" aria-hidden />
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            O painel administrativo é exclusivo para perfis de administração e monitoramento do MonitoraME.
          </p>
          <Button asChild variant="outline">
            <Link href="/oportunidades">Voltar para oportunidades</Link>
          </Button>
        </section>
      </>
    );
  }

  return (
    <AdminSessionProvider role={access.role} demo={access.demo}>
      {access.demo && <AdminDemoBanner profile={access.role} />}
      {children}
    </AdminSessionProvider>
  );
}
