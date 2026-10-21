import { CompanyDocument } from './entities';

export function validateRequiredDocuments(documents: CompanyDocument[]): boolean {
  const requiredDocs = documents.filter(doc => doc.required);
  return requiredDocs.every(doc => doc.status === 'ENVIADO' || doc.status === 'EM_ANALISE');
}

export function validateFileConstraints(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: 'O arquivo excede o limite máximo de 5MB.' };
  }
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato inválido. Apenas PDF, PNG ou JPEG são permitidos.' };
  }
  return { valid: true };
}
