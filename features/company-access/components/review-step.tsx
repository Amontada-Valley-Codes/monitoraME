'use client';

import React from 'react';
import { CompanyAccessRequest } from '../domain/entities';

interface ReviewStepProps {
  data: Partial<CompanyAccessRequest>;
  onUpdate: (fields: Partial<CompanyAccessRequest>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ReviewStep({ data, onNext, onPrev }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">Revisão Cadastral</h2>
      <p className="text-sm text-muted-foreground">Confirme os dados informados da empresa antes de prosseguir para o envio de documentos.</p>

      <div className="bg-muted/50 p-4 rounded-md space-y-2 text-sm">
        <div><strong>CNPJ:</strong> {data.cnpj}</div>
        <div><strong>Razão Social:</strong> {data.legalName}</div>
        <div><strong>Nome Fantasia:</strong> {data.tradeName || 'Não informado'}</div>
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrev} className="px-4 py-2 border rounded-md text-sm font-medium">
          Voltar
        </button>
        <button type="button" onClick={onNext} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Avançar para Documentos
        </button>
      </div>
    </div>
  );
}
