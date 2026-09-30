export type CompanyAccessStep = 'identification' | 'review' | 'documents'

export type AccessRequestStatus = 'draft' | 'under_review' | 'action_required' | 'approved' | 'rejected' | 'cancelled'
export type DocumentStatus = 'missing' | 'selected' | 'uploading' | 'uploaded' | 'invalid' | 'approved'

export interface Cnae {
  code: string
  description: string
}

export interface CompanyAddress {
  postalCode: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  ibgeCode?: string
}

export interface CompanyLookupResult {
  cnpj: string
  legalName: string
  tradeName?: string
  registrationStatus: 'active' | 'inactive' | 'suspended' | 'inapt' | 'closed'
  companySize: 'mei' | 'me' | 'epp' | 'other' | 'not_informed'
  primaryCnae: Cnae
  secondaryCnaes: Cnae[]
  address: CompanyAddress
  source: 'rfb' | 'manual'
  importedAt: string
}

export interface CompanyReviewFormData {
  legalName: string
  tradeName?: string
  cnpj: string
  stateRegistration?: string
  companySize: 'mei' | 'me' | 'epp'
  primaryCnae: Cnae
  secondaryCnaes: Cnae[]
  address: CompanyAddress
  legalRepresentativeName: string
  legalRepresentativeCpf: string
  notificationEmail: string
  commercialPhone: string
}

export interface UploadedDocument {
  id: string
  type: 'articles_of_incorporation' | 'cnpj_card' | 'representative_id' | 'power_of_attorney'
  name: string
  sizeInBytes: number
  required: boolean
  status: DocumentStatus
  rejectionReason?: string
  previewUrl?: string
}

export interface AccessRequestTimelineEvent {
  id: string
  label: string
  description?: string
  occurredAt?: string
  status: 'completed' | 'current' | 'pending' | 'failed'
}

export interface AccessRequest {
  protocol: string
  status: AccessRequestStatus
  currentStep: CompanyAccessStep
  company: CompanyReviewFormData
  documents: UploadedDocument[]
  submittedAt?: string
  updatedAt: string
  estimatedReviewAt?: string
  timeline: AccessRequestTimelineEvent[]
}