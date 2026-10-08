'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, useCallback } from 'react';
import { useLeadCta } from './lead-cta-context';
import { saveReturnTo } from './return-to';
import { useSession } from './session-context';

export function useProtectedNavigate() {
  const router = useRouter();
  const { status, waitUntilReady } = useSession();
  const { openLeadCta } = useLeadCta();
  return useCallback(async (href: string) => {
    const current = status === 'loading' ? await waitUntilReady(300) : status;
    if (current === 'authenticated') router.push(href);
    else { saveReturnTo(href); openLeadCta(); }
  }, [openLeadCta, router, status, waitUntilReady]);
}

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { href: string };
export const ProtectedLink = forwardRef<HTMLAnchorElement, Props>(function ProtectedLink({ href, onClick, ...props }, ref) {
  const navigate = useProtectedNavigate();
  const { status } = useSession();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void navigate(href);
  };
  return <Link ref={ref} href={href} prefetch={status === 'authenticated' ? props.prefetch : false} aria-disabled={status === 'loading'} onClick={handleClick} {...props} />;
});

