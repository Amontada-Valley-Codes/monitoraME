export function OpportunityFeedHeader() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-slate-900">
          Oportunidades em Aberto
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Encontre oportunidades de compras públicas para sua empresa.
        </p>
      </div>

      <div className="mt-4 flex border-t border-slate-100 text-sm font-semibold">
        <button className="relative flex-1 py-3 text-slate-900">
          Para Você
          <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-blue-600" />
        </button>

        <button className="flex-1 py-3 text-slate-500 hover:bg-slate-50">
          Recentes PNCP
        </button>

        <button className="flex-1 py-3 text-slate-500 hover:bg-slate-50">
          Dispensas
        </button>
      </div>
    </div>
  );
}