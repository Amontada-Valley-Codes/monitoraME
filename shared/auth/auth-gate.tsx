'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { MunicipalityLeadGate } from './municipality-lead-gate';
import { saveReturnTo } from './return-to';
import { useSession } from './session-context';

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (status !== 'anonymous') return;
    const returnTo = `${pathname}${searchParams.size ? `?${searchParams}` : ''}`;
    saveReturnTo(returnTo);
  }, [pathname, searchParams, status]);
  if (status === 'loading') return <div className="mx-auto max-w-6xl space-y-4 p-6"><p className="text-sm text-muted-foreground">Verificando acesso...</p><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (status === 'anonymous') return <MunicipalityLeadGate />;
  return children;
}

