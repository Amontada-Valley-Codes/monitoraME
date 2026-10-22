'use client';

import { CalendarDays } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { SelectField } from '@/shared/components/select-field';

import { useOverviewSelection } from '../pipeline/use-overview-selection';

export function OverviewFilters() {
  const { year, update } = useOverviewSelection();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => String(currentYear - index));

  return (
    <div className="analytics-overview-filters flex items-center gap-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="overview-year" className="sr-only">
          Exercício
        </Label>
        <div className="relative flex h-9 w-28 items-center">
          <CalendarDays
            className="pointer-events-none absolute left-2 top-1/2 z-10 size-3.5 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
          <SelectField
            value={year}
            onChange={(selectedYear) => update({ year: selectedYear })}
            options={years.map((item) => ({ value: item, label: item }))}
            label="Selecionar exercício"
            className="h-9 w-full items-center gap-1 rounded-md border-input bg-card py-0 pr-2 pl-7 text-xs font-normal shadow-none data-[size=default]:h-9"
          />
        </div>
      </div>

    </div>
  );
}
