'use client';

import { Suspense } from 'react';
import { AccessGateProvider } from '@/shared/components/access-gate';
import { AppShell } from '@/shared/layout/app-shell';
import { LoadingState } from '@/shared/components/states';
import { AnalyticsProvider } from '../data/context';
import { CommitmentDetailView } from './detail-page';

export function CommitmentDetailShell({ commitmentKey, from }: { commitmentKey: string; from: string }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AccessGateProvider hasAccount={false} hasPlan={false}>
        <AnalyticsProvider>
          <AppShell>
            <CommitmentDetailView commitmentKey={commitmentKey} from={from} />
          </AppShell>
        </AnalyticsProvider>
      </AccessGateProvider>
    </Suspense>
  );
}
