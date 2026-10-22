export type AdminAccessRequestStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface AdminAccessRequest {
  id: string;
  protocol: string;
  company_name: string;
  trade_name?: string | null;
  cnpj: string;
  company_size: 'MEI' | 'ME' | 'EPP' | 'GOV';
  municipality_name: string;
  uf: string;
  applicant_name: string;
  applicant_email: string;
  status: AdminAccessRequestStatus;
  review_comment?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
}

export interface ApproveAccessRequestPayload {
  review_comment?: string;
}

export interface RejectAccessRequestPayload {
  reason: string;
  review_comment: string;
}

export interface AccessRequestActionResponse {
  id: string;
  status: AdminAccessRequestStatus;
  review_comment?: string | null;
  updated_at: string;
}
