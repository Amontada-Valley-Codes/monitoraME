export function OpportunityRightPanel() {
  return (
    <aside className="hidden flex-1 bg-slate-50 px-6 py-4 lg:block">
      <div className="sticky top-4">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            type="text"
            placeholder="Buscar órgãos, atas e certames..."
            className="w-full rounded-full border-none bg-slate-200 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Inteligência MonitoraME Pro
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Dados do PNCP são 100% livres e públicos. Tenha IA para resumir
            exigências de habilitação, pipeline Kanban de propostas e radar de
            concorrentes.
          </p>

          <button
            type="button"
            className="mt-5 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Conhecer Recursos Pro
          </button>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-400">
          <p>
            Termos de Serviço · Privacidade · LAI Ceará · Acessibilidade
          </p>

          <p className="mt-1">
            © 2026 MonitoraME. Dados Abertos TCE-CE & PNCP
          </p>
        </div>
      </div>
    </aside>
  );
}