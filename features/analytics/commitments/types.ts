export const COMMITMENT_SORT_FIELDS = [
  'date',
  'municipality',
  'supplier',
  'expense_element',
  'gross_value',
  'cancelled_value',
  'net_value',
] as const;

export type CommitmentSortField = (typeof COMMITMENT_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export interface CommitmentListFilters {
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
  sort_by: CommitmentSortField;
  sort_order: SortOrder;
}

export interface CommitmentListItem {
  chave_empenho: string;
  display_id: string;
  numero_empenho: string;
  data_empenho: string;
  municipio_comprador: {
    codigo_ibge: string;
    codigo_tce: string;
    nome: string;
    uf: string;
  };
  fornecedor: {
    documento: string;
    cnpj: string | null;
    nome: string;
    porte: string;
    origem: string;
  };
  elemento_despesa: {
    codigo_natureza: string;
    codigo_exibicao: string;
    codigo_elemento: string;
    nome: string;
  };
  valores: {
    valor_empenhado_centavos: number;
    valor_anulado_centavos: number;
    valor_liquido_centavos: number;
  };
  possui_anulacao: boolean;
  quantidade_anulacoes: number;
}

export interface CommitmentListResponse {
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
  sorting: { sort_by: string; sort_order: SortOrder };
  items: CommitmentListItem[];
}

