import { Suspense, type ReactNode } from 'react';
import { OpportunityDemoProvider } from '@/features/opportunities/notification-context';
import { OpportunityShell } from '@/features/opportunities/components/opportunity-sidebar';

export default function OpportunitiesLayout({ children }: { children: ReactNode }) {
  return (
    <OpportunityDemoProvider>
      <Suspense fallback={<OpportunitiesLayoutLoading />}>
        <OpportunityShell>{children}</OpportunityShell>
      </Suspense>
    </OpportunityDemoProvider>
  );
}

function OpportunitiesLayoutLoading() {
  return <div className="h-svh animate-pulse bg-muted" />;
}
