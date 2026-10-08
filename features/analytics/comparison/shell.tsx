'use client';

import { Suspense } from 'react';
import { AccessGateProvider } from '@/shared/components/access-gate';
import { AppShell } from '@/shared/layout/app-shell';
import { LoadingState } from '@/shared/components/states';
import { AnalyticsProvider } from '../data/context';
import Compare from '../pages/compare';

export function ComparisonShell() {
  return <Suspense fallback={<div className="p-8"><LoadingState /></div>}><AccessGateProvider hasAccount={false} hasPlan={false}><AnalyticsProvider><AppShell><Compare /></AppShell></AnalyticsProvider></AccessGateProvider></Suspense>;
}
