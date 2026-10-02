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

  return (
    <article className="border-b border-slate-200 p-4 transition hover:bg-slate-50">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700">
          {opportunity.organization
            .split(' ')
            .map((word) => word[0])
            .slice(0, 3)
            .join('')}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900">
            {opportunity.organization}
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {opportunity.title}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {opportunity.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Valor estimado
              </span>

              <span className="font-bold text-slate-800">
                {formattedValue}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Abertura
              </span>

              <span className="font-semibold text-slate-800">
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Modalidade
              </span>

              <span className="font-semibold text-slate-800">
                {opportunity.modality}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Local
              </span>

              <span className="font-semibold text-slate-800">
                {opportunity.city} - {opportunity.state}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <Link
              href={`/oportunidades/${opportunity.id}`}
              className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}