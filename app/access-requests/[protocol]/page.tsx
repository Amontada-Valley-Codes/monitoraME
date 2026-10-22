'use client';

import React from 'react';
import { TrackingStatusView } from '@/features/company-access/components/tracking-status-view';

// Dados de exemplo para visualização imediata (mock inicial)
const mockRequest = {
  cnpj: '12.345.678/0001-99',
  legalName: 'Comércio e Serviços LTDA',
  tradeName: 'Exemplo Corp',
  status: 'PENDENTE' as const,
  protocol: 'PROT-2026-9841',
  estimatedAnalysisDays: 3,
  documents: [
    { id: 'doc-contrato', name: 'Contrato Social / Estatuto', required: true, status: 'ENVIADO' as const, fileUrl: 'contrato_social.pdf' },
    { id: 'doc-procuracao', name: 'Procuração (se aplicável)', required: false, status: 'PENDENTE' as const }
  ]
};

export default function TrackingPage() {
  const handleReplaceDocument = (docId: string, file: File) => {
    console.log(`Substituir documento ${docId} pelo arquivo ${file.name}`);
    // Implementar chamada ao serviço/API de upload
  };

  return (
    <main className="min-h-screen bg-background py-10">
      <TrackingStatusView request={mockRequest} onReplaceDocument={handleReplaceDocument} />
    </main>
  );
}
