import Link from 'next/link';
import { Opportunity } from '../types';

type OpportunityCardProps = {
  opportunity: Opportunity;
};

export function OpportunityCard({
  opportunity,
}: OpportunityCardProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(opportunity.estimatedValue);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(opportunity.openingDate));

  const initials = opportunity.organization
    .split(' ')
    .map((word) => word[0])
    .slice(0, 3)
    .join('');

  return (
    <article className="flex gap-3 px-4 py-4 transition hover:bg-slate-50">
      <div className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700">
          {initials}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-sm font-bold text-slate-900">
                {opportunity.organization}
              </span>

              <span className="text-blue-500">●</span>

              <span className="text-xs text-slate-500">
                @{initials.toLowerCase()}
              </span>

              <span className="text-xs text-slate-400">·</span>

              <span className="text-xs text-slate-500">
                há 2h
              </span>
            </div>

            <Link
              href={`/oportunidades/${opportunity.id}`}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Ver Detalhes
              <span>→</span>
            </Link>
          </div>

          <button
            type="button"
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Mais opções"
          >
            •••
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {opportunity.description}
        </p>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
          <div className="grid gap-3 text-xs sm:grid-cols-3">
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Valor Global
              </span>

              <span className="font-bold text-slate-800">
                {formattedValue}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Data de Abertura
              </span>

              <span className="font-semibold text-slate-800">
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Critério
              </span>

              <span className="font-semibold text-slate-800">
                Menor Preço por Item
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <Link
            href={`/oportunidades/${opportunity.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Ver Detalhes
            <span>→</span>
          </Link>

          <button
            type="button"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label="Salvar oportunidade"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}