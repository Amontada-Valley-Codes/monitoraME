export const SUPPLIER_SORT_FIELDS = [
  'supplier',
  'gross_value',
  'cancelled_value',
  'net_value',
  'commitments_count',
  'first_commitment',
  'last_commitment',
] as const;

export type SupplierSortField = (typeof SUPPLIER_SORT_FIELDS)[number];
export type SupplierSortOrder = 'asc' | 'desc';

export interface SupplierListFilters {
  uf: string;
  municipality_tce_code?: string;
  start_date: string;
  end_date: string;
  company_sizes: string[];
  supplier_origins: string[];
  expense_element_codes: string[];
  search?: string;
  page: number;
  page_size: 20 | 50 | 100;
  sort_by: SupplierSortField;
  sort_order: SupplierSortOrder;
}

export interface SupplierListItem {
  tipo_documento: 'CNPJ' | 'CPF';
  documento: string;
  cnpj: string | null;
  nome: string;
  porte: string;
  cadastro_status: string;
  origens_no_recorte: string[];
  valores: {
    valor_empenhado_centavos: number;
    valor_anulado_centavos: number;
    valor_considerado_centavos: number;
  };
  quantidade_empenhos: number;
  quantidade_anulacoes: number;
  quantidade_municipios: number;
  primeiro_empenho: string | null;
  ultimo_empenho: string | null;
}

export interface SupplierListResponse {
  source: string;
  data_source: string;
  external_requests: boolean;
  filters: {
    uf: string;
    municipality_tce_code: string | null;
    start_date: string;
    end_date: string;
    company_sizes: string[];
    supplier_origins: string[];
    expense_element_codes: string[];
    search: string | null;
  };
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
  };
  sorting: { sort_by: string; sort_order: SupplierSortOrder };
  items: SupplierListItem[];
}
