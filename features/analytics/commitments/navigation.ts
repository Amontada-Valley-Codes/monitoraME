export function buildCommitmentDetailHref(key: string, from: string): string {
  return `/analytics/empenhos/${encodeURIComponent(key)}?from=${encodeURIComponent(from)}`;
}

export function safeDecodeCommitmentKey(value: string): string {
  if (!value.includes('%')) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildCommitmentApiPath(routeKey: string): string {
  return `/analytics/tce/empenhos/${encodeURIComponent(safeDecodeCommitmentKey(routeKey))}`;
}

export function supplierHref(supplier: {
  documento: string;
  cnpj: string | null;
  cpf: string | null;
}): string | null {
  const document = supplier.documento.replace(/\D/g, '');
  const type = document.length === 14 || supplier.cnpj ? 'CNPJ'
    : document.length === 11 || supplier.cpf ? 'CPF'
      : null;
  if (type !== 'CNPJ' || document.length !== 14) return null;
  return `/analytics/fornecedores/${type}/${encodeURIComponent(document)}`;
}

export function safeCommitmentListPath(value?: string): string {
  if (!value) return '/analitico/empenhos';
  try {
    const url = new URL(value, 'https://monitorame.local');
    const isGeneralList = url.pathname === '/analitico/empenhos';
    const isSupplierList = /^\/analytics\/fornecedores\/(CNPJ\/\d{14}|CPF\/\d{11})\/empenhos$/.test(url.pathname);
    return url.origin === 'https://monitorame.local' && (isGeneralList || isSupplierList)
      ? `${url.pathname}${url.search}`
      : '/analitico/empenhos';
  } catch {
    return '/analitico/empenhos';
  }
}

