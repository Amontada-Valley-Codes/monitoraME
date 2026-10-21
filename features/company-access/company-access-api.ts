import { CompanyLookupResult, CompanyReviewFormData, UploadedDocument, AccessRequest } from './types'
import { mockCompanyLookup, mockAccessRequest } from './mocks'

export async function lookupCompanyByCnpj(cnpj: string): Promise<CompanyLookupResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cleanCnpj = cnpj.replace(/\D/g, '')
      if (cleanCnpj === '12345678000199') resolve(mockCompanyLookup)
      else reject(new Error('Empresa não encontrada na Receita Federal.'))
    }, 1200)
  })
}

export async function saveCompanyAccessDraft(data: Partial<CompanyReviewFormData>): Promise<void> {
  void data;
  return new Promise((resolve) => setTimeout(resolve, 800))
}

export async function submitCompanyAccessRequest(data: CompanyReviewFormData, documents: UploadedDocument[]): Promise<AccessRequest> {
  return new Promise((resolve) => setTimeout(() => resolve({ ...mockAccessRequest, documents, company: data }), 1500))
}

export async function getAccessRequest(protocol: string): Promise<AccessRequest> {
  void protocol;
  return new Promise((resolve) => setTimeout(() => resolve(mockAccessRequest), 800))
}

export async function cancelAccessRequest(protocol: string): Promise<void> {
  void protocol;
  return new Promise((resolve) => setTimeout(resolve, 800))
}
