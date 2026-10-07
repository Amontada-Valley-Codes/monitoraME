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

export interface SupplierRegistryAvailable {
  status: 'DISPONIVEL';
  razao_social: string | null;
  nome_fantasia: string | null;
  situacao_cadastral: string | null;
  matriz_filial: string | null;
  data_inicio_atividade: string | null;
  capital_social_centavos: number | null;
  natureza_juridica: string | null;
  simples_nacional: boolean | null;
  mei: boolean | null;
  municipio_sede: string | null;
  uf_sede: string | null;
  cnae_principal: { codigo: string | null; descricao: string | null } | null;
  observado_em: string | null;
  desatualizado: boolean;
  ultima_tentativa_status: string | null;
}

export type SupplierRegistry = SupplierRegistryAvailable | { status: 'NAO_DISPONIVEL' };

export interface SupplierDetailFilters {
  start_date: string;
  end_date: string;
  uf?: 'CE';
  municipality_tce_code?: string;
  company_sizes?: string[];
  supplier_origins?: string[];
  expense_element_codes?: string[];
}

export interface SupplierDetail {
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
  };
  fornecedor: {
    tipo_documento: 'CNPJ' | 'CPF';
    documento: string;
    cnpj: string | null;
    cpf?: string | null;
    nome: string;
    porte: string;
    origens_no_recorte: string[];
    cadastro: SupplierRegistry;
  };
  recorte: {
    start_date: string;
    end_date: string;
    municipality_tce_code: string | null;
    valor_empenhado_centavos: number;
    valor_anulado_centavos: number;
    valor_considerado_centavos: number;
    quantidade_empenhos: number;
    quantidade_anulacoes: number;
    quantidade_contratos: number;
    quantidade_licitacoes: number;
    quantidade_municipios: number;
    valor_medio_por_empenho_centavos: number;
    percentual_anulado: number;
    primeiro_empenho: string | null;
    ultimo_empenho: string | null;
    meses_com_movimento: number;
  };
  evolucao_mensal: SupplierMonthlyEvolution[];
  por_elemento_despesa: SupplierExpenseElement[];
  participacao_no_recorte: {
    valor_total_recorte_centavos: number;
    valor_fornecedor_centavos: number;
    percentual: number;
  };
  empenhos: { total_items: number; path: string };
}

export interface SupplierMonthlyEvolution {
  competencia: string;
  valor_empenhado_centavos: number;
  valor_anulado_centavos: number;
  valor_considerado_centavos: number;
  quantidade_empenhos: number;
}

export interface SupplierExpenseElement {
  codigo: string;
  nome: string;
  valor_empenhado_centavos: number;
  valor_anulado_centavos: number;
  valor_considerado_centavos: number;
  quantidade_empenhos: number;
  percentual: number;
}
