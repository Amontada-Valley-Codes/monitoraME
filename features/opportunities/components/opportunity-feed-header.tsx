export function OpportunityFeedHeader() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold text-slate-900">
          Oportunidades em Aberto
        </h1>

        <button
          type="button"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          aria-label="Configurações do feed"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
          </svg>
        </button>
      </div>

      <div className="flex text-sm font-semibold">
        <button className="relative flex-1 py-3 text-slate-900 transition hover:bg-slate-50">
          Para Você
          <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-blue-600" />
        </button>

        <button className="flex-1 py-3 text-slate-500 transition hover:bg-slate-50">
          Recentes PNCP
        </button>

        <button className="flex-1 py-3 text-slate-500 transition hover:bg-slate-50">
          Dispensas
        </button>
      </div>
    </div>
  );
}