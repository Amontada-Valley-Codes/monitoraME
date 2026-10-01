'use client';

import { CalendarDays } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { SelectField } from '@/shared/components/select-field';

import { useOverviewSelection } from '../pipeline/use-overview-selection';
import { TceMunicipalitySelect } from './tce-municipality-select';

export function OverviewFilters() {
  const { year, municipality, update } = useOverviewSelection();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => String(currentYear - index));

  return (
    <div className="no-print mb-6 flex flex-wrap items-end gap-3">
      <div className="flex w-full flex-col gap-1.5 sm:w-72">
        <Label htmlFor="overview-year" className="h-5 leading-5">
          Exercício
        </Label>
        <div className="relative flex h-11 w-full items-center">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
          <SelectField
            value={year}
            onChange={(selectedYear) => update({ year: selectedYear })}
            options={years.map((item) => ({ value: item, label: item }))}
            label="Selecionar exercício"
            className="h-11 w-full items-center gap-2 rounded-lg border-input bg-card py-0 pr-3 pl-9 text-sm font-normal shadow-xs data-[size=default]:h-11"
          />
        </div>
      </div>
      <div className="flex w-full flex-col gap-1.5 sm:w-72">
        <Label htmlFor="overview-municipality" className="h-5 leading-5">
          Município comprador
        </Label>
        <TceMunicipalitySelect
          value={municipality}
          onValueChange={(code) => update({ municipality: code ?? '' })}
          className="h-11 w-full items-center gap-2 rounded-lg border-input bg-card px-3 py-0 text-sm font-normal shadow-xs"
        />
      </div>
      <p className="ml-auto hidden text-xs text-muted-foreground xl:block">
        Período: 01/01/{year} a 31/12/{year}
      </p>
    </div>
  );
}
