import { COMMITMENT_SORT_FIELDS, type CommitmentSortField } from '../commitments/types';
import type { SupplierCommitmentFilters } from './commitments-types';

const COMPANY_SIZES = new Set(['ME', 'MEI', 'EPP', 'OTHER', 'UNKNOWN']);
const SUPPLIER_ORIGINS = new Set(['NO_MUNICIPIO_COMPRADOR', 'EM_OUTRO_MUNICIPIO', 'FORA_DO_CEARA', 'ORIGEM_NAO_IDENTIFICADA']);
const EXPENSE_ELEMENTS = new Set(['30', '32', '35', '39', '40', '51', '52']);

function isCivilDate(value: string | null): value is string {
  if (!value) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function parseSupplierCommitmentFilters(params: URLSearchParams): SupplierCommitmentFilters | null {
  const startDate = params.get('start_date');
  const endDate = params.get('end_date');
  if (!isCivilDate(startDate) || !isCivilDate(endDate)) return null;

  const page = Number(params.get('page'));
  const pageSize = Number(params.get('page_size'));
  const municipality = params.get('municipality_tce_code')?.trim();
  const rawSearch = params.get('search')?.trim();
  const rawSort = params.get('sort_by');
  return {
    start_date: startDate,
    end_date: endDate,
    ...(params.get('uf') === 'CE' ? { uf: 'CE' as const } : {}),
    ...(municipality && /^\d{3}$/.test(municipality) ? { municipality_tce_code: municipality } : {}),
    company_sizes: params.getAll('company_sizes').filter((value) => COMPANY_SIZES.has(value)),
    supplier_origins: params.getAll('supplier_origins').filter((value) => SUPPLIER_ORIGINS.has(value)),
    expense_element_codes: params.getAll('expense_element_codes').filter((value) => EXPENSE_ELEMENTS.has(value)),
    ...(rawSearch ? { search: rawSearch.slice(0, 200) } : {}),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    page_size: Number.isInteger(pageSize) && pageSize >= 1 && pageSize <= 100 ? pageSize : 50,
    sort_by: COMMITMENT_SORT_FIELDS.includes(rawSort as CommitmentSortField)
      ? rawSort as CommitmentSortField
      : 'net_value',
    sort_order: params.get('sort_order') === 'asc' ? 'asc' : 'desc',
  };
}

export function serializeSupplierCommitmentFilters(filters: SupplierCommitmentFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set('start_date', filters.start_date);
  params.set('end_date', filters.end_date);
  if (filters.uf) params.set('uf', filters.uf);
  if (filters.municipality_tce_code) params.set('municipality_tce_code', filters.municipality_tce_code);
  for (const value of filters.company_sizes) params.append('company_sizes', value);
  for (const value of filters.supplier_origins) params.append('supplier_origins', value);
  for (const value of filters.expense_element_codes) params.append('expense_element_codes', value);
  if (filters.search) params.set('search', filters.search);
  params.set('page', String(filters.page));
  params.set('page_size', String(filters.page_size));
  params.set('sort_by', filters.sort_by);
  params.set('sort_order', filters.sort_order);
  return params;
}

export function patchSupplierCommitmentFilters(
  current: SupplierCommitmentFilters,
  patch: Partial<SupplierCommitmentFilters>,
  resetPage = true,
): SupplierCommitmentFilters {
  return { ...current, ...patch, page: resetPage ? 1 : (patch.page ?? current.page) };
}

export function nextSupplierCommitmentSort(
  current: SupplierCommitmentFilters,
  selected: CommitmentSortField,
): Pick<SupplierCommitmentFilters, 'sort_by' | 'sort_order'> {
  return {
    sort_by: selected,
    sort_order: current.sort_by === selected && current.sort_order === 'desc' ? 'asc' : 'desc',
  };
}
