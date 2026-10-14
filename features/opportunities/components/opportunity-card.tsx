import Link from 'next/link';
import { ArrowRight, CircleCheck, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Opportunity } from '../types';
import { SaveOpportunityButton } from './save-opportunity-button';

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
    <article className="flex gap-3 px-4 py-5 transition-colors hover:bg-muted/40 sm:px-6">
      <div className="shrink-0">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
          {initials}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-sm font-semibold text-foreground">
                {opportunity.organization}
              </span>

              <CircleCheck className="size-3.5 fill-primary text-primary-foreground" />

              <span className="text-xs text-muted-foreground">
                @{initials.toLowerCase()}
              </span>

              <span className="text-xs text-muted-foreground">·</span>

              <span className="text-xs text-muted-foreground">
                há 2h
              </span>
            </div>

          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </Button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {opportunity.description}
        </p>

        <div className="mt-3 rounded-xl border bg-muted/50 px-4 py-3">
          <div className="grid gap-3 text-xs sm:grid-cols-3">
            <div>
              <span className="eyebrow block text-[10px] text-muted-foreground">
                Valor Global
              </span>

              <span className="data-value font-semibold text-foreground">
                {formattedValue}
              </span>
            </div>

            <div>
              <span className="eyebrow block text-[10px] text-muted-foreground">
                Data de Abertura
              </span>

              <span className="data-value font-medium text-foreground">
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="eyebrow block text-[10px] text-muted-foreground">
                Critério
              </span>

              <span className="font-medium text-foreground">
                Menor Preço por Item
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/oportunidades/${opportunity.id}`}>
              Ver detalhes
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>

          <SaveOpportunityButton opportunity={opportunity} compact />
        </div>
      </div>
    </article>
  );
}
