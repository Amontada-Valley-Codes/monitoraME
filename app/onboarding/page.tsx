'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_AFTER_ONBOARDING_PATH } from '@/shared/auth/config';
import { LeadCtaProvider, useLeadCta } from '@/shared/auth/lead-cta-context';
import { parseOnboardingToken, stripHashFromAddress } from '@/shared/auth/link-token';
import { consumeReturnTo } from '@/shared/auth/return-to';
import { notifySessionChanged, SessionProvider, useSession } from '@/shared/auth/session-context';
import { Providers } from '../providers';

type ViewState = 'loading' | 'invalid' | 'temporary-error';

export default function OnboardingPage() {
  return <Providers><SessionProvider><LeadCtaProvider><OnboardingContent /></LeadCtaProvider></SessionProvider></Providers>;
}

function OnboardingContent() {
  const [state, setState] = useState<ViewState>('loading');
  const started = useRef(false);
  const tokenRef = useRef<string | null>(null);
  const router = useRouter();
  const { refresh } = useSession();
  const { openLeadCta } = useLeadCta();

  const exchange = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) { setState('invalid'); return; }
    setState('loading');
    try {
      const response = await fetch('/api/auth/onboarding/exchange', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        setState(response.status >= 400 && response.status < 500 ? 'invalid' : 'temporary-error');
        return;
      }
      tokenRef.current = null;
      await refresh();
      notifySessionChanged();
      router.replace(consumeReturnTo() ?? DEFAULT_AFTER_ONBOARDING_PATH);
    } catch {
      setState('temporary-error');
    }
  }, [refresh, router]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    tokenRef.current = parseOnboardingToken(window.location.hash);
    stripHashFromAddress(window.location, window.history);
    void exchange();
  }, [exchange]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/30 p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm" aria-live="polite">
        {state === 'loading' ? (
          <><Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" /><h1 className="text-xl font-semibold">Validando seu acesso...</h1><p className="mt-2 text-sm text-muted-foreground">Isso deve levar apenas alguns segundos.</p></>
        ) : state === 'invalid' ? (
          <><AlertCircle className="mx-auto mb-4 size-8 text-destructive" /><h1 className="text-xl font-semibold">Este link não é mais válido</h1><p className="mt-2 text-sm text-muted-foreground">O link pode ter expirado, já ter sido usado ou ter sido substituído. Solicite um novo para continuar.</p><Button className="mt-6 w-full" onClick={openLeadCta}>Solicitar novo link</Button></>
        ) : (
          <><AlertCircle className="mx-auto mb-4 size-8 text-amber-600" /><h1 className="text-xl font-semibold">Não foi possível validar agora</h1><p className="mt-2 text-sm text-muted-foreground">Tente novamente sem recarregar esta página. Se você recarregar, será necessário pedir um novo link.</p><Button className="mt-6 w-full" onClick={() => void exchange()}>Tentar novamente</Button></>
        )}
      </section>
    </main>
  );
}
