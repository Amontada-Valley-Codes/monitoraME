export type CompanyStatus = 'PENDENTE' | 'LIBERADO' | 'SUSPENSO';

export type DocumentSubStatus = 'PENDENTE' | 'ENVIADO' | 'EM_ANALISE' | 'CORRECAO_SOLICITADA';

export interface CompanyDocument {
  id: string;
  name: string;
  required: boolean;
  status: DocumentSubStatus;
  fileUrl?: string;
  rejectionReason?: string;
}

export interface CompanyAccessRequest {
  cnpj: string;
  legalName: string;
  tradeName?: string;
  status: CompanyStatus;
  documents: CompanyDocument[];
  protocol: string;
  estimatedAnalysisDays: number;
}
