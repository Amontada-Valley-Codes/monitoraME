'use client';

import { createContext, Suspense, useCallback, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LeadCtaModal } from './lead-cta-modal';
import { consumeReturnTo, isValidReturnTo, saveReturnTo } from './return-to';
import { useSession } from './session-context';

type LeadCtaContextValue = { openLeadCta: () => void; closeLeadCta: () => void };
const LeadCtaContext = createContext<LeadCtaContextValue | null>(null);
export function LeadCtaProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openLeadCta = useCallback(() => setOpen(true), []);
  const closeLeadCta = useCallback(() => setOpen(false), []);
  return (
    <LeadCtaContext.Provider value={{ openLeadCta, closeLeadCta }}>
      {children}
      <Suspense fallback={null}>
        <LeadCtaModal open={open} onOpenChange={setOpen} />
        <LeadCtaUrlSync setOpen={setOpen} />
        <LeadCtaSessionSync open={open} setOpen={setOpen} />
      </Suspense>
    </LeadCtaContext.Provider>
  );
}

function LeadCtaSessionSync({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  const router = useRouter();
  const { status } = useSession();
  useEffect(() => {
    if (status !== 'authenticated' || !open) return;
    // A session can arrive from the email link in another tab.
    setOpen(false);
    const destination = consumeReturnTo();
    if (destination) router.replace(destination);
  }, [open, router, setOpen, status]);
  return null;
}

function LeadCtaUrlSync({ setOpen }: { setOpen: Dispatch<SetStateAction<boolean>> }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (searchParams.get('cta') !== 'lead') return;
    const forwarded = searchParams.get('returnTo');
    if (forwarded && isValidReturnTo(forwarded)) saveReturnTo(forwarded);
    // The URL is an external navigation signal for this controlled dialog.
    setOpen(true);
    const next = new URLSearchParams(searchParams.toString());
    next.delete('cta');
    next.delete('returnTo');
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
  }, [pathname, router, searchParams, setOpen]);
  return null;
}

export function useLeadCta() {
  const value = useContext(LeadCtaContext);
  if (!value) throw new Error('LeadCtaProvider ausente');
  return value;
}

