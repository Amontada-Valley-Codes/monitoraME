export function OpportunitySidebar() {
  return (
    <aside className="hidden w-[275px] shrink-0 border-r border-slate-200 bg-white xl:flex xl:h-screen xl:flex-col xl:justify-between xl:px-4 xl:py-4 xl:sticky xl:top-0">
      <div>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Monitora<span className="text-blue-600">ME</span>
          </span>
        </div>

        <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Oportunidades
        </div>

        <nav className="mt-2 space-y-1">
          <button className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-sm font-semibold text-blue-700">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>

              <span>Editais Abertos</span>
            </div>

            <span className="h-4 w-1.5 rounded-full bg-blue-600" />
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
            <svg
              className="h-5 w-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>

            <span>Editais Salvos</span>
          </button>
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gestão & Inteligência
          </div>

          <nav className="mt-2 space-y-1">
            <button className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                </svg>

                <span>Área da Empresa</span>
              </div>

              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                PRO
              </span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
              <svg
                className="h-5 w-5 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>

              <span>Perfil Fornecedor</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>

              <span>Mais opções</span>
            </button>
          </nav>
        </div>

        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          Filtrar Oportunidades
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            SN

            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">
              Soluções Nordeste
            </p>

            <p className="truncate text-[10px] text-slate-400">
              34.819.•••/0001-92
            </p>
          </div>

          <span className="text-slate-400">•••</span>
        </div>
      </div>
    </aside>
  );
}