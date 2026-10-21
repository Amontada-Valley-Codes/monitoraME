import { CompanyAccessRequest, CompanyDocument } from '../domain/entities';

export interface CreateCompanyPayload {
  cnpj: string;
  legalName: string;
  tradeName?: string | null;
  companySize: 'MEI' | 'ME' | 'EEP' | 'GOV';
  primaryCnae: string;
  phone: string;
  email: string;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  address: {
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    municipalityCode: string;
  };
}

export interface ICompanyAccessRepository {
  getRequestStatus(cnpj: string): Promise<CompanyAccessRequest>;
  createCompany(data: CreateCompanyPayload): Promise<{ id: string; status: string }>;
  submitAccessRequest(companySize: 'mei' | 'me' | 'eep' | 'gov', file: File): Promise<any>;
}

export const companyAccessApiRepository: ICompanyAccessRepository = {
  async getRequestStatus(cnpj: string): Promise<CompanyAccessRequest> {
    const res = await fetch(`/api/access-requests/${cnpj}`);
    if (!res.ok) throw new Error('Erro ao buscar status da solicitação.');
    return res.json();
  },

  async createCompany(data: CreateCompanyPayload): Promise<{ id: string; status: string }> {
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || 'Erro ao registrar os dados básicos da empresa.');
    }

    return res.json();
  },

  async submitAccessRequest(companySize: 'mei' | 'me' | 'eep' | 'gov', file: File): Promise<any> {
    const formData = new FormData();
    
    const fieldMap = {
      mei: 'ccmei',
      me: 'simplifiedBoardCertificate',
      eep: 'legalEntityCivilRegistryCertificate',
      gov: 'cnpjRegistrationCertificate'
    };

    formData.append(fieldMap[companySize], file);

    const res = await fetch(`/api/companies/me/access-requests/${companySize}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || 'Erro ao enviar solicitação de acesso e documento.');
    }

    return res.json();
  },
};
