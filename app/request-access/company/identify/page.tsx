import { AppHeader } from '../../../../components/ui/app-header'
import { CompanyIdentificationForm } from '../../../../features/company-access/company-identification-form'
import { ShieldCheck, CheckCircle2, Scale, ExternalLink } from 'lucide-react'

export default function IdentifyPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      <AppHeader />
      
      <div className="max-w-300 mx-auto px-4 pt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Processo de Credenciamento Oficial</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Habilitação de Conta Empresarial</h1>
          <p className="text-slate-500 text-sm max-w-3xl">
            Vincule seu CNPJ para participar de dispensas de licitação, cotas exclusivas MPE e receber alertas sob medida.
          </p>
          <div className="flex items-start justify-between mt-10 pt-8 border-t border-slate-100">

            <div className="flex flex-col items-center flex-1 relative">
              <div className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">Etapa 1</div>
              <div className="font-bold text-slate-800 mb-2">Identificação</div>
              <div className="text-xs text-slate-500 mb-3">CNPJ & RFB</div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">Em andamento</span>
              <div className="absolute top-1/2 left-[60%] w-full h-px bg-slate-200 -z-10"></div>
            </div>

            <div className="flex flex-col items-center flex-1 relative">
              <div className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">Etapa 2</div>
              <div className="font-bold text-slate-400 mb-2">Revisão Cadastral</div>
              <div className="text-xs text-slate-400 mb-3">Dados da Empresa</div>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">Pendente</span>
              <div className="absolute top-1/2 left-[60%] w-full h-px bg-slate-200 -z-10"></div>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">Etapa 3</div>
              <div className="font-bold text-slate-400 mb-2">Validação Documental</div>
              <div className="text-xs text-slate-400 mb-3">Vínculo & Anexos</div>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">Pendente</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            <CompanyIdentificationForm />
          </div>
          <div className="w-full lg:w-95 flex flex-col gap-6 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Vantagens do Credenciamento</h3>
              <p className="text-sm text-slate-500 mb-6">Ao validar o CNPJ da sua Micro ou Pequena Empresa, você destrava os privilégios da LC 123/2006:</p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700"><strong>Art. 48 da LC 123/2006</strong> com tratamento favorecido e diferenciado assegurado.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Alertas imediatos de dispensas de licitação de até <strong>R$ 80K</strong> e compras diretas nos seus CNAEs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Direito de preferência no critério de desempate fictício contra empresas de grande porte.</span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <Scale className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Art. 48, LC 123/2006</h4>
                  <p className="text-xs text-slate-500 mt-1">Cotas exclusivas de até 25% em certames públicos.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold tracking-wider uppercase mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Precisa de ajuda?</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Dificuldade para validar o CNPJ ou divergência nas bases federais? Fale com a equipe de apoio técnico.
              </p>
              <button className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                Abrir chamado com analista
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}