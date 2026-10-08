export function parseOnboardingToken(hash: string): string | null {
  const value = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash).get('token');
  return value?.trim() || null;
}

export function stripHashFromAddress(location: Pick<Location, 'pathname' | 'search'>, history: Pick<History, 'replaceState'>) {
  history.replaceState(null, '', `${location.pathname}${location.search}`);
}

