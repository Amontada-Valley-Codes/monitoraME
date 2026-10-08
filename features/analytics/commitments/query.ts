import {
  COMMITMENT_SORT_FIELDS,
  type CommitmentListFilters,
  type CommitmentSortField,
  type SortOrder,
} from './types';

export const DEFAULT_COMMITMENT_FILTERS: CommitmentListFilters = {
  uf: 'CE',
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  company_sizes: [],
  supplier_origins: [],
  expense_element_codes: [],
  page: 1,
  page_size: 50,
  sort_by: 'net_value',
  sort_order: 'desc',
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseCommitmentFilters(params: URLSearchParams): CommitmentListFilters {
  const page = Number(params.get('page'));
  const pageSize = Number(params.get('page_size'));
  const sortBy = params.get('sort_by');
  const sortOrder = params.get('sort_order');
  const startDate = params.get('start_date');
  const endDate = params.get('end_date');
  const search = params.get('search')?.trim();
  const municipality = params.get('municipality_tce_code')?.trim();

  return {
    uf: params.get('uf') || DEFAULT_COMMITMENT_FILTERS.uf,
    start_date: startDate && DATE_PATTERN.test(startDate)
      ? startDate
      : DEFAULT_COMMITMENT_FILTERS.start_date,
    end_date: endDate && DATE_PATTERN.test(endDate)
      ? endDate
      : DEFAULT_COMMITMENT_FILTERS.end_date,
    ...(municipality ? { municipality_tce_code: municipality } : {}),
    company_sizes: params.getAll('company_sizes').filter(Boolean),
    supplier_origins: params.getAll('supplier_origins').filter(Boolean),
    expense_element_codes: params.getAll('expense_element_codes').filter(Boolean),
    ...(search ? { search: search.slice(0, 200) } : {}),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    page_size: pageSize === 20 || pageSize === 100 ? pageSize : 50,
    sort_by: COMMITMENT_SORT_FIELDS.includes(sortBy as CommitmentSortField)
      ? (sortBy as CommitmentSortField)
      : 'net_value',
    sort_order: sortOrder === 'asc' ? 'asc' : 'desc',
  };
}

export function nextCommitmentSort(
  currentField: CommitmentSortField,
  currentOrder: SortOrder,
  selectedField: CommitmentSortField,
): { sort_by: CommitmentSortField; sort_order: SortOrder } {
  return {
    sort_by: selectedField,
    sort_order: currentField === selectedField && currentOrder === 'desc' ? 'asc' : 'desc',
  };
}

export function serializeCommitmentFilters(filters: CommitmentListFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set('uf', filters.uf);
  params.set('start_date', filters.start_date);
  params.set('end_date', filters.end_date);
  if (filters.municipality_tce_code) {
    params.set('municipality_tce_code', filters.municipality_tce_code);
  }
  for (const value of filters.company_sizes) params.append('company_sizes', value);
  for (const value of filters.supplier_origins) params.append('supplier_origins', value);
  for (const value of filters.expense_element_codes) {
    params.append('expense_element_codes', value);
  }
  if (filters.search) params.set('search', filters.search);
  params.set('page', String(filters.page));
  params.set('page_size', String(filters.page_size));
  params.set('sort_by', filters.sort_by);
  params.set('sort_order', filters.sort_order);
  return params;
}

export function patchCommitmentFilters(
  current: CommitmentListFilters,
  patch: Partial<CommitmentListFilters>,
  resetPage = true,
): CommitmentListFilters {
  return { ...current, ...patch, page: resetPage ? 1 : (patch.page ?? current.page) };
}

