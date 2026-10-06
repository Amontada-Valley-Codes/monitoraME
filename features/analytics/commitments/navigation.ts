export function buildCommitmentDetailHref(key: string, from: string): string {
  return `/analytics/empenhos/${encodeURIComponent(key)}?from=${encodeURIComponent(from)}`;
}

export function safeCommitmentListPath(value?: string): string {
  if (!value?.startsWith('/analitico/empenhos')) return '/analitico/empenhos';
  try {
    const url = new URL(value, 'https://monitorame.local');
    return url.origin === 'https://monitorame.local' && url.pathname === '/analitico/empenhos'
      ? `${url.pathname}${url.search}`
      : '/analitico/empenhos';
  } catch {
    return '/analitico/empenhos';
  }
}

