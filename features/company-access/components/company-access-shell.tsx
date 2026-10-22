'use client';

import React from 'react';
import { useCompanyAccess } from '../hooks/use-company-access';
import { IdentificationStep } from './identification-step';
import { ReviewStep } from './review-step';
import { DocumentsStep } from './documents-step';

export function CompanyAccessShell() {
  const { currentStep, nextStep, prevStep, request, setRequest } = useCompanyAccess();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <nav aria-label="Progresso da Solicitação" className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            <span className="w-8 h-8 rounded-full border flex items-center justify-center text-sm">1</span>
            <span>Identificação CNPJ</span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-border" />
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            <span className="w-8 h-8 rounded-full border flex items-center justify-center text-sm">2</span>
            <span>Revisão Cadastral</span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-border" />
          <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            <span className="w-8 h-8 rounded-full border flex items-center justify-center text-sm">3</span>
            <span>Validação Documental</span>
          </div>
        </nav>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        {currentStep === 1 && (
          <IdentificationStep 
            data={request} 
            onUpdate={(fields) => setRequest(prev => ({ ...prev, ...fields }))}
            onNext={nextStep} 
          />
        )}
        {currentStep === 2 && (
          <ReviewStep 
            data={request} 
            onUpdate={(fields) => setRequest(prev => ({ ...prev, ...fields }))}
            onNext={nextStep} 
            onPrev={prevStep} 
          />
        )}
        {currentStep === 3 && (
          <DocumentsStep 
            documents={request.documents || []}
            onUpdateDocuments={(docs) => setRequest(prev => ({ ...prev, documents: docs }))}
            onPrev={prevStep}
          />
        )}
      </div>
    </div>
  );
}
