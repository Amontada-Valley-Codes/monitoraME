import {
  SUPPLIER_SORT_FIELDS,
  type SupplierListFilters,
  type SupplierSortField,
  type SupplierSortOrder,
} from './types';
import type { SupplierDetailFilters } from './types';

export const DEFAULT_SUPPLIER_FILTERS: SupplierListFilters = {
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

export const SUPPLIER_EXERCISES = ['2025', '2024', '2023', '2022', '2021'] as const;

export function supplierExerciseFilters(exercise: string) {
  const normalized = /^\d{4}$/.test(exercise) ? exercise : '2025';
  return {
    start_date: `${normalized}-01-01`,
    end_date: `${normalized}-12-31`,
  };
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const COMPANY_SIZE_VALUES = new Set(['ME', 'MEI', 'EPP', 'OTHER', 'UNKNOWN']);
const SUPPLIER_ORIGIN_VALUES = new Set([
  'NO_MUNICIPIO_COMPRADOR',
  'EM_OUTRO_MUNICIPIO',
  'FORA_DO_CEARA',
  'ORIGEM_NAO_IDENTIFICADA',
]);
const EXPENSE_ELEMENT_VALUES = new Set(['30', '32', '35', '39', '40', '51', '52']);

function isCivilDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function parseSupplierDetailFilters(params: URLSearchParams): SupplierDetailFilters | null {
  const startDate = params.get('start_date');
  const endDate = params.get('end_date');
  if (!startDate || !endDate || !isCivilDate(startDate) || !isCivilDate(endDate)) return null;

  const municipality = params.get('municipality_tce_code')?.trim();
  return {
    start_date: startDate,
    end_date: endDate,
    ...(params.get('uf') === 'CE' ? { uf: 'CE' as const } : {}),
    ...(municipality && /^\d{3}$/.test(municipality)
      ? { municipality_tce_code: municipality }
      : {}),
    company_sizes: params.getAll('company_sizes').filter((value) => COMPANY_SIZE_VALUES.has(value)),
    supplier_origins: params.getAll('supplier_origins').filter((value) => SUPPLIER_ORIGIN_VALUES.has(value)),
    expense_element_codes: params.getAll('expense_element_codes').filter((value) => EXPENSE_ELEMENT_VALUES.has(value)),
  };
}

export function serializeSupplierDetailFilters(filters: SupplierDetailFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set('start_date', filters.start_date);
  params.set('end_date', filters.end_date);
  if (filters.uf) params.set('uf', filters.uf);
  if (filters.municipality_tce_code) params.set('municipality_tce_code', filters.municipality_tce_code);
  for (const value of filters.company_sizes ?? []) params.append('company_sizes', value);
  for (const value of filters.supplier_origins ?? []) params.append('supplier_origins', value);
  for (const value of filters.expense_element_codes ?? []) params.append('expense_element_codes', value);
  return params;
}

export function parseSupplierFilters(params: URLSearchParams): SupplierListFilters {
  const page = Number(params.get('page'));
  const pageSize = Number(params.get('page_size'));
  const sortBy = params.get('sort_by');
  const startDate = params.get('start_date');
  const requestedExercise = startDate && isCivilDate(startDate)
    ? startDate.slice(0, 4)
    : DEFAULT_SUPPLIER_FILTERS.start_date.slice(0, 4);
  const closedExercise = supplierExerciseFilters(requestedExercise);
  const municipality = params.get('municipality_tce_code')?.trim();
  const search = params.get('search')?.trim();

  return {
    uf: params.get('uf') === 'CE' ? 'CE' : DEFAULT_SUPPLIER_FILTERS.uf,
    start_date: closedExercise.start_date,
    end_date: closedExercise.end_date,
    ...(municipality && /^\d{3}$/.test(municipality)
      ? { municipality_tce_code: municipality }
      : {}),
    company_sizes: params.getAll('company_sizes').filter((value) => COMPANY_SIZE_VALUES.has(value)),
    supplier_origins: params.getAll('supplier_origins').filter((value) => SUPPLIER_ORIGIN_VALUES.has(value)),
    expense_element_codes: params.getAll('expense_element_codes').filter((value) => EXPENSE_ELEMENT_VALUES.has(value)),
    ...(search ? { search: search.slice(0, 200) } : {}),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    page_size: pageSize === 20 || pageSize === 100 ? pageSize : 50,
    sort_by: SUPPLIER_SORT_FIELDS.includes(sortBy as SupplierSortField)
      ? (sortBy as SupplierSortField)
      : 'net_value',
    sort_order: params.get('sort_order') === 'asc' ? 'asc' : 'desc',
  };
}

export function serializeSupplierFilters(filters: SupplierListFilters): URLSearchParams {
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

export function patchSupplierFilters(
  current: SupplierListFilters,
  patch: Partial<SupplierListFilters>,
  resetPage = true,
): SupplierListFilters {
  return { ...current, ...patch, page: resetPage ? 1 : (patch.page ?? current.page) };
}

export function nextSupplierSort(
  currentField: SupplierSortField,
  currentOrder: SupplierSortOrder,
  selectedField: SupplierSortField,
): { sort_by: SupplierSortField; sort_order: SupplierSortOrder } {
  return {
    sort_by: selectedField,
    sort_order: currentField === selectedField && currentOrder === 'desc' ? 'asc' : 'desc',
  };
}
