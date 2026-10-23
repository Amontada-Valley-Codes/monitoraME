'use client';

import { CalendarDays } from 'lucide-react';
import { SelectField } from '@/shared/components/select-field';
import { useOverviewSelection } from '../pipeline/use-overview-selection';

export function OverviewFilters() {
  const { year, update } = useOverviewSelection();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => String(currentYear - index));

  return (
    <div className="analytics-overview-filters flex w-fit items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">
          {"Exerc\u00edcio de refer\u00eancia"}
        </span>
        <div className="relative flex h-9 w-36 items-center">
          <CalendarDays
            className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
          <SelectField
            value={year}
            onChange={(selectedYear) => update({ year: selectedYear })}
            options={years.map((item) => ({ value: item, label: item }))}
            label="Selecionar exerc\u00edcio"
            className="h-9 w-full items-center gap-1 rounded-lg border-input bg-background py-0 pr-2 pl-9 text-sm font-semibold shadow-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring data-[size=default]:h-9"
          />
        </div>
      </div>
    </div>
  );
}
