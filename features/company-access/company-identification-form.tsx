'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { lookupCompanyByCnpj } from './company-access-api'
import { CompanyLookupResult } from './types'
import { useCompanyAccess } from './company-access-state'
import { Search, Building2, AlertTriangle, Zap, Lock, FileText, MapPin, ExternalLink, ChevronRight } from 'lucide-react'

export function CompanyIdentificationForm() {
  const router = useRouter()
  const { updateFormData } = useCompanyAccess()
  const [cnpj, setCnpj] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompanyLookupResult | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await lookupCompanyByCnpj(cnpj)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CNPJ')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (result) {
      updateFormData({
        ...result,
        companySize:
          result.companySize === 'mei' || result.companySize === 'me' || result.companySize === 'epp'
            ? result.companySize
            : undefined,
      })
      router.push('/request-access/company/review')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div>
          <h2 className="text-blue-600 text-xs font-bold tracking-wider uppercase">Passo 01 de 03 • Módulo Fiscal & Compliance MPE</h2>
          <p className="text-sm font-medium text-slate-600">Integração Ativa: RFB & OpenCNPJ API</p>
        </div>
      </div>

      <div className="p-8 flex-1">
        
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="cnpj" className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-slate-400" />
              CNPJ da Empresa
            </label>
            <span className="text-xs text-slate-400">Obrigatório para habilitação</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                id="cnpj" 
                value={cnpj} 
                onChange={(e) => setCnpj(e.target.value)} 
                placeholder="00.000.000/0001-00" 
                required 
                disabled={loading}
                className="w-full h-12 pl-10 pr-24 rounded-lg border border-slate-200 bg-white text-slate-900 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {cnpj.length >= 14 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Válido
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={loading || cnpj.length < 14} 
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? 'Consultando...' : <><Search className="w-4 h-4" /> Consultar Receita Federal / OpenCNPJ</>}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-8 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">

            <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{result.legalName}</h3>
                  <p className="text-sm text-slate-500">Nome Fantasia: {result.tradeName || 'Não informado'}</p>
                  <p className="text-sm text-slate-500">CNPJ: {result.cnpj} • Matriz</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Situação {result.registrationStatus === 'active' ? 'Ativa' : 'Irregular'}
                </div>
                <span className="text-xs text-slate-400 mt-2">Desde 14/03/2018</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Classificação Fiscal & Porte</span>
                <p className="text-sm font-semibold text-slate-900 mb-3">Empresa de Pequeno Porte (EPP)</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">Optante Simples Nacional</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-200">MEI: Não Enquadrado</span>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Natureza Jurídica</span>
                <p className="text-sm font-semibold text-slate-900 mb-1">206-2 - Sociedade Empresária Limitada</p>
                <p className="text-xs text-slate-500">Qualificação: 49 - Sócio-Administrador Ativo</p>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Atividade Econômica Principal (CNAE)</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">Compatível com Dispensa MPE</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {result.primaryCnae.code} - {result.primaryCnae.description}
              </p>
              <p className="text-xs text-slate-500 ml-6">
                Secundários: {result.secondaryCnaes.map(c => `${c.code} (${c.description})`).join(', ')}
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Endereço Fiscal Cadastrado na RFB</span>
              <p className="text-sm font-semibold text-slate-900 mb-1">
                {result.address.street}, {result.address.number} - {result.address.district}
              </p>
              <p className="text-xs text-slate-500">
                {result.address.city} - {result.address.state}, CEP {result.address.postalCode} • Jurisdição fiscal: 3ª Região Fiscal
              </p>
              <MapPin className="absolute top-5 right-5 w-5 h-5 text-slate-300" />
            </div>

            {/* Warning Box */}
            <div className="mt-6 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-r-xl p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Aviso Normativo: Regularidade Cadastral para Compras Públicas
              </h4>
              <p className="text-xs text-amber-800/80 mb-3 leading-relaxed">
                CNPJs com situação Baixada, Suspensa ou Inapta não estão aptos a contratar com a administração pública nos termos da Lei nº 14.133/2021 (Nova Lei de Licitações) e Lei Complementar nº 123/2006.
              </p>
              <button className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 flex items-center gap-1">
                Consultar Certidão Conjunta de Débitos <ExternalLink className="w-3 h-3" />
              </button>
            </div>

          </div>
        )}

      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button className="px-6 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            Salvar rascunho e sair
          </button>
          <button 
            onClick={handleContinue}
            disabled={!result}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar e continuar para Etapa 2
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1">
          <Lock className="w-3 h-3" />
          Seus dados empresariais são utilizados exclusivamente para fins de verificação e habilitação de fornecedor cívico no MonitoraME.
        </p>
      </div>
    </div>
  )
}
