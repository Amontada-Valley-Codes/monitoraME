import type { CommitmentListItem, CommitmentSortField, SortOrder } from '../commitments/types';

export interface SupplierCommitmentFilters {
  start_date: string;
  end_date: string;
  uf?: 'CE';
  municipality_tce_code?: string;
  company_sizes: string[];
  supplier_origins: string[];
  expense_element_codes: string[];
  search?: string;
  page: number;
  page_size: number;
  sort_by: CommitmentSortField;
  sort_order: SortOrder;
}

export interface SupplierCommitmentsResponse {
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
  fornecedor: { tipo_documento: 'CNPJ' | 'CPF'; documento: string; nome: string };
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
