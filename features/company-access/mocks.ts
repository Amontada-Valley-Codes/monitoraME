import { CompanyLookupResult, AccessRequest } from './types'

export const mockCompanyLookup: CompanyLookupResult = {
  cnpj: '12345678000199',
  legalName: 'MONITORA ME TECNOLOGIA LTDA',
  tradeName: 'MonitoraME',
  registrationStatus: 'active',
  companySize: 'me',
  primaryCnae: { code: '6204-0/00', description: 'Consultoria em tecnologia da informação' },
  secondaryCnaes: [{ code: '6201-5/01', description: 'Desenvolvimento de programas de computador sob encomenda' }],
  address: {
    postalCode: '60000-000',
    street: 'Avenida Beira Mar',
    number: '1000',
    district: 'Meireles',
    city: 'Fortaleza',
    state: 'CE',
  },
  source: 'rfb',
  importedAt: new Date().toISOString(),
}

export const mockAccessRequest: AccessRequest = {
  protocol: 'REQ-2026-88A9F',
  status: 'under_review',
  currentStep: 'documents',
  company: {
    ...mockCompanyLookup,
    legalRepresentativeName: 'Sara de Sousa Magalhães',
    legalRepresentativeCpf: '00011122233',
    notificationEmail: 'contato@monitorame.com.br',
    commercialPhone: '85999999999',
    companySize: 'me',
  },
  documents: [
    { id: '1', type: 'cnpj_card', name: 'cartao_cnpj.pdf', sizeInBytes: 150000, required: true, status: 'uploaded' },
    { id: '2', type: 'articles_of_incorporation', name: 'contrato_social.pdf', sizeInBytes: 250000, required: true, status: 'uploaded' },
    { id: '3', type: 'representative_id', name: 'cnh_sara.jpg', sizeInBytes: 500000, required: true, status: 'uploaded' }
  ],
  updatedAt: new Date().toISOString(),
  estimatedReviewAt: new Date(Date.now() + 86400000 * 2).toISOString(),
  timeline: [
    { id: 't1', label: 'Solicitação iniciada', status: 'completed', occurredAt: new Date().toISOString() },
    { id: 't2', label: 'Documentação enviada', status: 'completed', occurredAt: new Date().toISOString() },
    { id: 't3', label: 'Análise da equipe', status: 'current' },
    { id: 't4', label: 'Conta habilitada', status: 'pending' },
  ]
}