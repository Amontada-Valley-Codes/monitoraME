'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { LockKeyhole } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TeamUpgradeModal } from '@/components/cta_count';
import type { RestrictedFeature } from '@/shared/config/access';

type AccessState = {
  hasAccount: boolean;
  hasPlan: boolean;
};

type AccessGateContextValue = AccessState & {
  requestAccess: (feature: RestrictedFeature) => boolean;
};

const AccessGateContext = createContext<AccessGateContextValue | null>(null);

export function AccessGateProvider({
  children,
  hasAccount,
  hasPlan,
}: AccessState & { children: ReactNode }) {
  const [requestedFeature, setRequestedFeature] = useState<RestrictedFeature | null>(null);

  const requestAccess = useCallback(
    (feature: RestrictedFeature) => {
      if (hasPlan) return true;
      setRequestedFeature(feature);
      return false;
    },
    [hasPlan],
  );

  const value = useMemo(
    () => ({ hasAccount, hasPlan, requestAccess }),
    [hasAccount, hasPlan, requestAccess],
  );

  return (
    <AccessGateContext.Provider value={value}>
      {children}
      <TeamUpgradeModal
        open={requestedFeature !== null}
        onOpenChange={(open) => {
          if (!open) setRequestedFeature(null);
        }}
        hasAccount={hasAccount}
        feature={requestedFeature ?? undefined}
      />
    </AccessGateContext.Provider>
  );
}

export function useAccessGate() {
  const context = useContext(AccessGateContext);
  if (!context) throw new Error('AccessGateProvider ausente');
  return context;
}

export function RestrictedFeaturePlaceholder({ feature }: { feature: RestrictedFeature }) {
  const { requestAccess } = useAccessGate();

  return (
    <section className="panel mx-auto max-w-3xl overflow-hidden p-0" aria-labelledby="restricted-title">
      <div className="border-b bg-primary/5 px-6 py-8 sm:px-10">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-medium text-primary">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Recurso da assinatura
        </span>
        <h1 id="restricted-title" className="text-2xl font-semibold tracking-tight">
          {feature.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {feature.description}
        </p>
      </div>
      <div className="flex flex-col items-start gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="text-sm text-muted-foreground">
          A visão geral e os filtros públicos continuam disponíveis gratuitamente.
        </p>
        <Button onClick={() => requestAccess(feature)}>
          <LockKeyhole aria-hidden="true" />
          Ver como liberar
        </Button>
      </div>
    </section>
  );
}
