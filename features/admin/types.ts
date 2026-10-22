/** Contratos do painel administrativo. Os nomes seguem os campos esperados da API (snake_case). */

export type AdminRole = 'admin' | 'monitor';
export type CompanyAccessStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type CompanySize = 'mei' | 'me' | 'epp' | 'other';

export type AdminMunicipality = { name: string; uf: string; ibge_code: string };

export type CompanyStatusEvent = {
  id: string;
  status: CompanyAccessStatus;
  occurred_at: string;
  author_name: string;
  reason?: string;
};

export type AdminCompany = {
  id: string;
  legal_name: string;
  trade_name: string | null;
  cnpj: string;
  company_size: CompanySize;
  municipality: AdminMunicipality;
  primary_cnae: { code: string; description: string };
  access_status: CompanyAccessStatus;
  plan_name: string | null;
  contact_email: string;
  registered_at: string;
  updated_at: string;
  version: number;
  access_request: { protocol: string; submitted_at: string; documents_count: number } | null;
  status_history: CompanyStatusEvent[];
};

export type AdminActivity = {
  id: string;
  occurred_at: string;
  author_name: string;
  description: string;
  company_id: string | null;
};

export type CompanyAccessChange =
  | { kind: 'suspend'; reason: string }
  | { kind: 'reactivate' };

export type AdminOverview = {
  generated_at: string;
  companies_by_status: Record<CompanyAccessStatus, number>;
  companies_by_size: Record<CompanySize, number>;
  top_municipalities: { municipality: AdminMunicipality; total: number }[];
  pending_requests: { company_id: string; legal_name: string; protocol: string; submitted_at: string; documents_count: number }[];
  recent_activity: AdminActivity[];
};
