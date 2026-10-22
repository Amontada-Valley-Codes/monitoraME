'use client';

import React from 'react';
import { CompanyAccessRequest } from '../domain/entities';

interface TrackingStatusViewProps {
  request: CompanyAccessRequest;
  onReplaceDocument: (docId: string, file: File) => void;
}

export function TrackingStatusView({ request, onReplaceDocument }: TrackingStatusViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIBERADO': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Liberado</span>;
      case 'SUSPENSO': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">Suspenso</span>;
      default: return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">Pendente de Análise</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Acompanhamento da Solicitação</h1>
            <p className="text-sm text-muted-foreground mt-1">Protocolo: <span className="font-mono font-semibold">{request.protocol}</span></p>
          </div>
          <div>{getStatusBadge(request.status)}</div>
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
          <div><strong>Empresa:</strong> {request.legalName}</div>
          <div><strong>CNPJ:</strong> {request.cnpj}</div>
          <div><strong>Previsão de Análise:</strong> {request.estimatedAnalysisDays} dias úteis</div>
        </div>

        {request.status === 'PENDENTE' && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Subestados e Validação Documental</h3>
            <p className="text-xs text-muted-foreground">Acompanhe abaixo o estado dos seus documentos ou realize correções solicitadas pela administração.</p>

            <div className="space-y-2">
              {request.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-muted/30 p-3 rounded text-sm">
                  <div>
                    <span className="font-medium">{doc.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({doc.status})</span>
                    {doc.rejectionReason && <p className="text-xs text-destructive mt-1">Motivo: {doc.rejectionReason}</p>}
                  </div>
                  <label className="cursor-pointer text-xs underline font-medium text-primary">
                    Corrigir / Substituir
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onReplaceDocument(doc.id, file);
                      }} 
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
