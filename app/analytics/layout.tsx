import { Suspense, type ReactNode } from 'react';
import { Providers } from '@/app/providers';
import { CompleteAccountGate } from '@/shared/auth/complete-account-gate';
import { LeadCtaProvider } from '@/shared/auth/lead-cta-context';
import { SessionProvider } from '@/shared/auth/session-context';

// This layout conditionally replaces its children while the session is loading
// or the account is gated, so descendant segments cannot always be rendered
// during Next.js instant-navigation validation.
export const instant = false;

export default function AnalyticsProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <SessionProvider>
        <LeadCtaProvider>
          <Suspense fallback={<main className="page-content"><div className="panel h-96 animate-pulse" /></main>}>
            <CompleteAccountGate>{children}</CompleteAccountGate>
          </Suspense>
        </LeadCtaProvider>
      </SessionProvider>
    </Providers>
  );
}
