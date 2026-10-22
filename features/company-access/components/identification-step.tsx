'use client';

import React, { useState } from 'react';
import { CompanyAccessRequest } from '../domain/entities';

interface IdentificationStepProps {
  data: Partial<CompanyAccessRequest>;
  onUpdate: (fields: Partial<CompanyAccessRequest>) => void;
  onNext: () => void;
}

export function IdentificationStep({ data, onUpdate, onNext }: IdentificationStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCnpjBlur = async () => {
    if (!data.cnpj || data.cnpj.length < 14) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pipeline/tce/overview?cnpj=${data.cnpj}`);
      if (res.ok) {
        const json = await res.json();
        onUpdate({
          legalName: json.legalName || 'Empresa Exemplo S.A.',
          tradeName: json.tradeName || 'Exemplo',
        });
      } else {
        setError('CNPJ não localizado automaticamente. Preencha os dados manualmente para prosseguir.');
      }
    } catch {
      setError('Erro ao consultar CNPJ. O cadastro poderá prosseguir preenchendo os campos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.cnpj || !data.legalName) {
      setError('Por favor, informe o CNPJ e a Razão Social.');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">Identificação da Empresa</h2>
      <p className="text-sm text-muted-foreground">Insira o CNPJ para buscar os dados cadastrais automaticamente.</p>

      {error && <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">CNPJ</label>
        <input 
          type="text" 
          value={data.cnpj || ''} 
          onChange={(e) => onUpdate({ cnpj: e.target.value })}
          onBlur={handleCnpjBlur}
          placeholder="00.000.000/0001-00"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        {loading && <span className="text-xs text-muted-foreground mt-1 block">A consultar dados na Receita...</span>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Razão Social</label>
        <input 
          type="text" 
          value={data.legalName || ''} 
          onChange={(e) => onUpdate({ legalName: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nome Fantasia (Opcional)</label>
        <input 
          type="text" 
          value={data.tradeName || ''} 
          onChange={(e) => onUpdate({ tradeName: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Avançar para Revisão
        </button>
      </div>
    </form>
  );
}
