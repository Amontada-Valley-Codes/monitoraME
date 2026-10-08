'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated';
type SessionContextValue = {
  status: SessionStatus;
  accountStatus: string | null;
  refresh: () => Promise<SessionStatus>;
  clear: () => Promise<void>;
  waitUntilReady: (timeoutMs?: number) => Promise<SessionStatus>;
};

const SessionContext = createContext<SessionContextValue | null>(null);
export const SESSION_CHANGED_EVENT = 'analytics:session-changed';

export function notifySessionChanged() {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  try {
    localStorage.setItem(SESSION_CHANGED_EVENT, String(Date.now()));
    const channel = new BroadcastChannel('analytics-auth');
    channel.postMessage({ type: 'session-changed' });
    channel.close();
  } catch {
    // The local event above still updates this tab.
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const refresh = useCallback(async (): Promise<SessionStatus> => {
    try {
      const response = await fetch('/api/session', { cache: 'no-store' });
      const body = await response.json() as { authenticated?: boolean; accountStatus?: string | null };
      const next = body.authenticated ? 'authenticated' : 'anonymous';
      setStatus(next);
      setAccountStatus(body.accountStatus ?? null);
      return next;
    } catch {
      setStatus('anonymous');
      setAccountStatus(null);
      return 'anonymous';
    }
  }, []);

  useEffect(() => {
    // Session hydration is an external network synchronization.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);
  useEffect(() => {
    const update = () => { void refresh(); };
    window.addEventListener(SESSION_CHANGED_EVENT, update);
    window.addEventListener('storage', update);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('analytics-auth');
      channel.addEventListener('message', update);
    } catch {}
    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, update);
      window.removeEventListener('storage', update);
      channel?.close();
    };
  }, [refresh]);

  const clear = useCallback(async () => {
    await fetch('/api/session', { method: 'DELETE' }).catch(() => undefined);
    setStatus('anonymous');
    setAccountStatus(null);
    queryClient.clear();
    notifySessionChanged();
  }, [queryClient]);

  const waitUntilReady = useCallback(async (timeoutMs = 300) => {
    if (status !== 'loading') return status;
    const result = await Promise.race<SessionStatus | null>([
      refresh(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return result ?? 'anonymous';
  }, [refresh, status]);

  return <SessionContext.Provider value={{ status, accountStatus, refresh, clear, waitUntilReady }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('SessionProvider ausente');
  return value;
}

