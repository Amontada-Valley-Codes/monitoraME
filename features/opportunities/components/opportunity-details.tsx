import Link from 'next/link';
import { Opportunity } from '../types';

type OpportunityDetailsProps = {
  opportunity: Opportunity;
};

export function OpportunityDetails({
  opportunity,
}: OpportunityDetailsProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(opportunity.estimatedValue);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(opportunity.openingDate));

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Link
        href="/oportunidades"
        className="text-sm font-semibold text-blue-600 hover:underline"
      >
        ← Voltar para oportunidades
      </Link>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <span className="text-sm font-semibold text-blue-600">
          {opportunity.modality}
        </span>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {opportunity.title}
        </h1>

        <p className="mt-2 text-sm font-semibold text-slate-600">
          {opportunity.organization}
        </p>

        <p className="mt-6 leading-relaxed text-slate-700">
          {opportunity.description}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-400">
              Valor estimado
            </span>

            <p className="mt-1 font-semibold text-slate-900">
              {formattedValue}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-400">
              Data de abertura
            </span>

            <p className="mt-1 font-semibold text-slate-900">
              {formattedDate}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-400">
              Modalidade
            </span>

            <p className="mt-1 font-semibold text-slate-900">
              {opportunity.modality}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-400">
              Local
            </span>

            <p className="mt-1 font-semibold text-slate-900">
              {opportunity.city} - {opportunity.state}
            </p>
          </div>
        </div>

        {opportunity.officialUrl && (
          <a
            href={opportunity.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Acessar publicação oficial
          </a>
        )}
      </div>
    </div>
  );
}