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
}, context?: {
  from?: string;
  commitmentDate?: string;
  exercise?: number | string;
}): string | null {
  const document = supplier.documento.replace(/\D/g, '');
  const type = document.length === 14 || supplier.cnpj ? 'CNPJ'
    : document.length === 11 || supplier.cpf ? 'CPF'
      : null;
  if (type !== 'CNPJ' || document.length !== 14) return null;
  const exercise = supplierExercise(context);
  const path = `/analytics/fornecedores/${type}/${encodeURIComponent(document)}`;
  if (!exercise) return path;

  const params = new URLSearchParams({
    start_date: `${exercise}-01-01`,
    end_date: `${exercise}-12-31`,
  });
  return `${path}?${params.toString()}`;
}

function supplierExercise(context?: {
  from?: string;
  commitmentDate?: string;
  exercise?: number | string;
}): string | null {
  if (context?.from) {
    try {
      const params = new URL(context.from, 'https://monitorame.local').searchParams;
      const startYear = params.get('start_date')?.match(/^(\d{4})-\d{2}-\d{2}$/)?.[1];
      const endYear = params.get('end_date')?.match(/^(\d{4})-\d{2}-\d{2}$/)?.[1];
      if (startYear && startYear === endYear) return startYear;
    } catch {
      // O detalhe do empenho ainda fornece um fallback seguro abaixo.
    }
  }

  const exercise = String(context?.exercise ?? '');
  if (/^\d{4}$/.test(exercise)) return exercise;
  return context?.commitmentDate?.match(/^(\d{4})-\d{2}-\d{2}$/)?.[1] ?? null;
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

