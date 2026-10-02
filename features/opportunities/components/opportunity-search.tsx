export function OpportunitySearch() {
  return (
    <div className="border-b border-slate-200 bg-white p-4">
      <div className="rounded-xl border border-slate-200 p-4">
        <input
          type="text"
          placeholder="O que sua empresa quer fornecer hoje? Digite objeto, CNAE ou município..."
          className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Município
            </button>

            <button className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              MPE
            </button>

            <button className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Modalidade
            </button>

            <button className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Data
            </button>
          </div>

          <button className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            Buscar Editais
          </button>
        </div>
      </div>
    </div>
  );
}