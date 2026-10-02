export function OpportunitySearch() {
  return (
    <div className="border-b border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
          SN
        </div>

        <div className="min-w-0 flex-1">
          <input
            type="text"
            placeholder="O que sua empresa quer fornecer hoje? Digite objeto, CNAE ou município..."
            className="w-full border-none bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-500"
          />

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Município"
                className="rounded-full p-2 text-blue-600 transition hover:bg-blue-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>

              <button
                type="button"
                title="Cota MPE"
                className="rounded-full p-2 text-blue-600 transition hover:bg-blue-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z" />
                </svg>
              </button>

              <button
                type="button"
                title="Modalidade"
                className="rounded-full p-2 text-blue-600 transition hover:bg-blue-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
                  <path d="M1 14h6M9 8h6M17 16h6" />
                </svg>
              </button>

              <button
                type="button"
                title="Data"
                className="rounded-full p-2 text-blue-600 transition hover:bg-blue-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 11h18" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Buscar Editais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}