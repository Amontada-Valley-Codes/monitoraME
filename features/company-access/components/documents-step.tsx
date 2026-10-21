'use client';

import React, { useState } from 'react';
import { CompanyDocument } from '../domain/entities';
import { validateFileConstraints, validateRequiredDocuments } from '../domain/validation';
import { companyAccessApiRepository } from '../infrastructure/company-access-api';

interface DocumentsStepProps {
  documents: CompanyDocument[];
  onUpdateDocuments: (docs: CompanyDocument[]) => void;
  onPrev: () => void;
}

export function DocumentsStep({ documents, onUpdateDocuments, onPrev }: DocumentsStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFileConstraints(file);
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const updated = documents.map(doc => 
      doc.id === docId ? { ...doc, status: 'ENVIADO' as const, fileUrl: file.name } : doc
    );
    onUpdateDocuments(updated);
  };

  const isComplete = validateRequiredDocuments(documents);

  const handleFinalSubmit = async () => {
    if (!isComplete) {
      setError('Existem documentos obrigatórios pendentes de envio.');
      return;
    }

    if (!selectedFile) {
      setError('Por favor, anexe o documento obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      // Passa explicitamente o porte ('me') e o arquivo selecionado
      await companyAccessApiRepository.submitAccessRequest('me', selectedFile);
      window.location.href = '/access-requests/protocolo-gerado';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao submeter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Validação Documental Obrigatória</h2>
        <p className="text-sm text-muted-foreground">Anexe os documentos necessários para validação do perfil da empresa.</p>
      </div>

      {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded border border-destructive/20">{error}</div>}

      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="border p-4 rounded-md flex items-center justify-between">
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                {doc.name}
                {doc.required ? (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Obrigatório</span>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Opcional</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Status: <span className="font-semibold">{doc.status}</span> {doc.fileUrl && `(${doc.fileUrl})`}</p>
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-medium hover:bg-muted">
                {doc.status === 'ENVIADO' ? 'Substituir' : 'Enviar Arquivo'}
                <input type="file" className="hidden" onChange={(e) => handleFileChange(doc.id, e)} accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrev} className="px-4 py-2 border rounded-md text-sm font-medium">
          Voltar
        </button>
        <button 
          type="button" 
          onClick={handleFinalSubmit} 
          disabled={!isComplete || submitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
        >
          {submitting ? 'A enviar...' : 'Finalizar Solicitação'}
        </button>
      </div>
    </div>
  );
}
