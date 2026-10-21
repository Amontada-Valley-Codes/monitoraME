import { ICompanyAccessRepository } from '../infrastructure/company-access-api';
import { validateRequiredDocuments } from '../domain/validation';
import { CompanyAccessRequest } from '../domain/entities';

export class CompanyAccessService {
  constructor(private repository: ICompanyAccessRepository) {}

  async loadRequest(cnpj: string): Promise<CompanyAccessRequest> {
    return this.repository.getRequestStatus(cnpj);
  }

  async submitDocumentsAndComplete(companySize: 'mei' | 'me' | 'eep' | 'gov', file: File) {
    return this.repository.submitAccessRequest(companySize, file);
  }
}
