'use client';

import { useState } from 'react';
import { CompanyAccessRequest } from '../domain/entities';

export function useCompanyAccess(initialData?: CompanyAccessRequest) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [request, setRequest] = useState<Partial<CompanyAccessRequest>>(initialData || {
    documents: [
      { id: 'doc-contrato', name: 'Contrato Social / Estatuto', required: true, status: 'PENDENTE' },
      { id: 'doc-procuracao', name: 'Procuração (se aplicável)', required: false, status: 'PENDENTE' }
    ]
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return {
    currentStep,
    nextStep,
    prevStep,
    request,
    setRequest,
  };
}
