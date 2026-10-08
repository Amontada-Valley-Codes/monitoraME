import type { SupplierListItem } from './types';

export function supplierDocumentDigits(document: string): string {
  return document.replace(/\D/g, '');
}

export function formatSupplierDocument(item: Pick<SupplierListItem, 'documento' | 'tipo_documento'>): string {
  const digits = supplierDocumentDigits(item.documento);
  if (item.tipo_documento !== 'CNPJ' || digits.length !== 14) return item.documento;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function canOpenSupplierDetail(document: string): boolean {
  const length = supplierDocumentDigits(document).length;
  return length === 11 || length === 14;
}

export function buildSupplierDetailHref(
  item: Pick<SupplierListItem, 'documento' | 'tipo_documento'>,
  currentFilters: URLSearchParams | string,
): string | null {
  const document = supplierDocumentDigits(item.documento);
  if (document.length !== 11 && document.length !== 14) return null;
  const query = typeof currentFilters === 'string'
    ? currentFilters.replace(/^\?/, '')
    : currentFilters.toString();
  const path = `/analytics/fornecedores/${encodeURIComponent(item.tipo_documento)}/${encodeURIComponent(document)}`;
  return query ? `${path}?${query}` : path;
}
