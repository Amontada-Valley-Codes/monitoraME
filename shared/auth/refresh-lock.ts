'use client';

import { notifySessionChanged } from './session-context';

const LOCK_NAME = 'analytics-auth-refresh';
const STORAGE_LOCK_KEY = `${LOCK_NAME}:lock`;
const LOCK_TTL_MS = 10_000;

async function requestRefresh() {
  const response = await fetch('/api/session/refresh', { method: 'POST', cache: 'no-store' });
  if (!response.ok) throw new Error('Não foi possível renovar a sessão.');
  notifySessionChanged();
}

async function localStorageLock() {
  const owner = crypto.randomUUID();
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const now = Date.now();
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_LOCK_KEY) ?? 'null') as { owner?: string; expiresAt?: number } | null;
      if (!current?.expiresAt || current.expiresAt <= now) {
        localStorage.setItem(STORAGE_LOCK_KEY, JSON.stringify({ owner, expiresAt: now + LOCK_TTL_MS }));
        const acquired = JSON.parse(localStorage.getItem(STORAGE_LOCK_KEY) ?? 'null') as { owner?: string } | null;
        if (acquired?.owner === owner) {
          try { await requestRefresh(); } finally {
            const latest = JSON.parse(localStorage.getItem(STORAGE_LOCK_KEY) ?? 'null') as { owner?: string } | null;
            if (latest?.owner === owner) localStorage.removeItem(STORAGE_LOCK_KEY);
          }
          return;
        }
      }
    } catch {
      await requestRefresh();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Tempo esgotado ao renovar a sessão.');
}

let refreshPromise: Promise<void> | null = null;

async function runRefreshWithLock() {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    await navigator.locks.request(LOCK_NAME, requestRefresh);
    return;
  }
  await localStorageLock();
}

export function refreshSessionAcrossTabs() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = runRefreshWithLock().finally(() => { refreshPromise = null; });
  return refreshPromise;
}


