export const RETURN_TO_KEY = 'analytics:returnTo';
export const RETURN_TO_TTL_MS = 24 * 60 * 60 * 1000;

type StoredReturnTo = { path: string; createdAt: number };

export function isValidReturnTo(path: unknown): path is string {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return false;
  if (/[\u0000-\u001f\u007f]/.test(path) || /^[a-z][a-z\d+.-]*:/i.test(path)) return false;
  try {
    const url = new URL(path, 'https://monitorame.local');
    if (url.origin !== 'https://monitorame.local') return false;
    const allowed = url.pathname.startsWith('/analytics/') || url.pathname === '/analitico' || url.pathname.startsWith('/analitico/');
    if (!allowed) return false;
    if (url.pathname === '/onboarding' || url.pathname.startsWith('/login')) return false;
    return true;
  } catch {
    return false;
  }
}

export function saveReturnTo(path: string, now = Date.now()): boolean {
  if (typeof window === 'undefined' || !isValidReturnTo(path)) return false;
  try {
    localStorage.setItem(RETURN_TO_KEY, JSON.stringify({ path, createdAt: now } satisfies StoredReturnTo));
    return true;
  } catch {
    return false;
  }
}

export function peekReturnTo(now = Date.now()): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RETURN_TO_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredReturnTo>;
    if (!isValidReturnTo(value.path) || typeof value.createdAt !== 'number' || now - value.createdAt > RETURN_TO_TTL_MS || value.createdAt > now + 60_000) {
      localStorage.removeItem(RETURN_TO_KEY);
      return null;
    }
    return value.path;
  } catch {
    localStorage.removeItem(RETURN_TO_KEY);
    return null;
  }
}

export function consumeReturnTo(now = Date.now()): string | null {
  const path = peekReturnTo(now);
  if (typeof window !== 'undefined' && path) localStorage.removeItem(RETURN_TO_KEY);
  return path;
}

