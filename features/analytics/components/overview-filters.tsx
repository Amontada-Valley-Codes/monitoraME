'use client';

import { useState } from 'react';
import { CalendarDays, MapPin, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/shared/components/select-field';

import { useOverviewSelection } from '../pipeline/use-overview-selection';

export function OverviewFilters() {
  const { year, municipality, update } = useOverviewSelection();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => String(currentYear - index));

  return (
    <div className="no-print mb-6 flex flex-wrap items-end gap-3">
      <Badge variant="outline" className="bg-card px-3 py-3 text-primary">
        CE · Ceará
      </Badge>
      <div className="grid gap-1.5">
        <Label htmlFor="overview-year">Exercício</Label>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          <SelectField
            value={year}
            onChange={(selectedYear) => update({ year: selectedYear })}
            options={years.map((item) => ({ value: item, label: item }))}
            label="Selecionar exercício"
            className="w-32 bg-card"
          />
        </div>
      </div>
      <MunicipalityCodeFilter
        key={municipality ?? 'all'}
        initialValue={municipality ?? ''}
        onApply={(value) => update({ municipality: value })}
      />
      {municipality && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Consultar todos os municípios"
          onClick={() => update({ municipality: '' })}
        >
          <RotateCcw className="size-4" />
        </Button>
      )}
      <p className="ml-auto hidden text-xs text-muted-foreground xl:block">
        Período: 01/01/{year} a 31/12/{year}
      </p>
    </div>
  );
}

function MunicipalityCodeFilter({
  initialValue,
  onApply,
}: {
  initialValue: string;
  onApply: (value: string) => void;
}) {
  const [municipalityDraft, setMunicipalityDraft] = useState(initialValue);

  return (
    <form
      className="grid gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(municipalityDraft);
      }}
    >
        <Label htmlFor="overview-municipality">Código do município no TCE</Label>
        <div className="flex gap-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
            <Input
              id="overview-municipality"
              value={municipalityDraft}
              inputMode="numeric"
              maxLength={3}
              pattern="[0-9]{3}"
              placeholder="Todos"
              aria-label="Código de município do TCE, com três dígitos"
              className="w-40 bg-card pl-9"
              onChange={(event) => {
                setMunicipalityDraft(event.target.value.replace(/\D/g, '').slice(0, 3));
              }}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={municipalityDraft.length > 0 && municipalityDraft.length !== 3}
          >
            Aplicar
          </Button>
        </div>
    </form>
  );
}
