import { Building2, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm h-16 flex items-center">
      <div className="flex items-center justify-between px-6 w-full max-w-[1400px] mx-auto">
   
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">MonitoraME</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao MonitoraME
          </Link>
          
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">Carlos Silva</p>
              <p className="text-xs text-slate-500">Conta Pessoal</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}