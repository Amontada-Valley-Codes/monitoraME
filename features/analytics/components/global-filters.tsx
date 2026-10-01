'use client';

import { useState } from 'react';
import {
  CalendarDays,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/shared/components/select-field';
import { dateLabel } from '@/shared/lib/format';

import { useAnalytics } from '../data/context';
import { CATEGORIES, MUNICIPALITIES, ORIGINS, SIZES } from '../data/fixtures';

const FILTER_TRIGGER_CLASS = 'h-11 rounded-md border-border bg-card px-3 shadow-xs';

interface MunicipalityPickerProps {
  value: string;
  onChange: (selected: string) => void;
  all?: boolean;
}

export function MunicipalityPicker({
  value,
  onChange,
  all = true,
}: MunicipalityPickerProps) {
  const [open, setOpen] = useState(false);

  const municipalityList = all
    ? [{ id: 'all', name: 'Todos os municípios' }, ...MUNICIPALITIES]
    : MUNICIPALITIES;

  const selectedName =
    MUNICIPALITIES.find((m) => m.id === value)?.name ?? 'Todos os municípios';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar município"
          className={`${FILTER_TRIGGER_CLASS} w-full min-w-52 justify-between sm:w-auto`}
        >
          <MapPin className="size-4 text-primary" />
          {selectedName}
          <ChevronsUpDown className="size-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar município..." />
          <CommandList>
            <CommandEmpty>Município não encontrado.</CommandEmpty>
            <CommandGroup>
              {municipalityList.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  {item.name}
                  {value === item.id && <Check className="ml-auto size-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function GlobalFilters() {
  const { filters, setFilters, reset } = useAnalytics();
  const [open, setOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const [range, setRange] = useState<DateRange | undefined>();
  const [dateStart, setDateStart] = useState(filters.start);
  const [dateEnd, setDateEnd] = useState(filters.end);

  const activeFiltersCount =
    (filters.size !== 'all' ? 1 : 0) +
    (filters.origin !== 'all' ? 1 : 0) +
    (filters.categories.length !== 7 ? 1 : 0);

  const formatCivilDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  const handleDatesOpenChange = (isOpen: boolean) => {
    setDatesOpen(isOpen);
    if (isOpen) {
      setDateStart(filters.start);
      setDateEnd(filters.end);
      setRange({
        from: new Date(filters.start + 'T12:00:00'),
        to: new Date(filters.end + 'T12:00:00'),
      });
    }
  };

  const handleYearPreset = (year: string) => {
    setFilters({
      start: `${year}-01-01`,
      end: year === '2026' ? '2026-08-31' : `${year}-12-31`,
    });
    setDatesOpen(false);
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, categoryId]
        : prev.categories.filter((id) => id !== categoryId),
    }));
  };

  const isInvalidDateRange = dateStart > dateEnd;

  return (
    <div className="no-print mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <MunicipalityPicker
          value={filters.municipality}
          onChange={(municipality) => setFilters({ municipality })}
        />

        {/* Date Filter Popover */}
        <Popover open={datesOpen} onOpenChange={handleDatesOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={FILTER_TRIGGER_CLASS}>
              <CalendarDays className="size-4 text-primary" />
              {dateLabel(filters.start)} — {dateLabel(filters.end)}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto max-w-[calc(100vw-2rem)] p-4"
            align="start"
          >
            <div className="mb-3 flex gap-2">
              {['2024', '2025', '2026'].map((year) => (
                <Button
                  key={year}
                  size="sm"
                  variant="outline"
                  onClick={() => handleYearPreset(year)}
                >
                  {year}
                  {year === '2026' ? ' · jan–ago' : ''}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date-start">Início</Label>
                <Input
                  id="date-start"
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date-end">Fim</Label>
                <Input
                  id="date-end"
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </div>
            </div>

            <Calendar
              mode="range"
              selected={range}
              onSelect={(selectedRange) => {
                setRange(selectedRange);
                if (selectedRange?.from) {
                  setDateStart(formatCivilDate(selectedRange.from));
                }
                if (selectedRange?.to) {
                  setDateEnd(formatCivilDate(selectedRange.to));
                }
              }}
              locale={ptBR}
              numberOfMonths={1}
              defaultMonth={new Date(dateStart + 'T12:00:00')}
            />

            {isInvalidDateRange && (
              <p role="alert" className="text-sm text-destructive">
                O início deve ser anterior ao fim.
              </p>
            )}

            <Button
              className="w-full"
              disabled={!dateStart || !dateEnd || isInvalidDateRange}
              onClick={() => {
                setFilters({ start: dateStart, end: dateEnd });
                setDatesOpen(false);
              }}
            >
              Aplicar período
            </Button>
          </PopoverContent>
        </Popover>

        {/* More Filters Sheet Trigger */}
        <Button
          variant="outline"
          className={FILTER_TRIGGER_CLASS}
          onClick={() => {
            setDraft(filters);
            setOpen(true);
          }}
        >
          <SlidersHorizontal className="size-4" />
          Mais filtros
          {activeFiltersCount > 0 && (
            <Badge className="ml-1">{activeFiltersCount}</Badge>
          )}
        </Button>

        {(activeFiltersCount > 0 || filters.municipality !== 'all') && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Limpar filtros globais"
            onClick={reset}
          >
            <RotateCcw className="size-4" />
          </Button>
        )}

        <p className="ml-auto hidden text-xs text-muted-foreground xl:block">
          Referência cadastral: ago/2026
        </p>
      </div>

      {filters.origin !== 'all' && (
        <p className="mt-3 text-xs text-muted-foreground">
          Indicadores geográficos ocultos enquanto há recorte de origem, para
          evitar percentuais de 100%.
        </p>
      )}

      {/* Slide-out Sheet for Extended Filters */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Refinar análise</SheetTitle>
            <SheetDescription>
              Os filtros acompanham sua navegação e os arquivos exportados.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 p-6">
            <div>
              <Label className="mb-2">Porte empresarial</Label>
              <SelectField
                value={draft.size}
                onChange={(size) => setDraft({ ...draft, size })}
                label="Porte empresarial"
                className="w-full"
                options={[
                  { value: 'all', label: 'Todos os portes' },
                  ...SIZES.map((size) => ({
                    value: size.id,
                    label: size.name,
                  })),
                ]}
              />
            </div>

            <div>
              <Label className="mb-2">Origem do fornecedor</Label>
              <SelectField
                value={draft.origin}
                onChange={(origin) => setDraft({ ...draft, origin })}
                label="Origem do fornecedor"
                className="w-full"
                options={[
                  { value: 'all', label: 'Todas as origens' },
                  ...ORIGINS.map((origin) => ({
                    value: origin.id,
                    label: origin.name,
                  })),
                ]}
              />
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-medium">
                Elementos de despesas considerados
              </legend>
              <div className="space-y-4">
                {CATEGORIES.map((category) => (
                  <Label
                    key={category.id}
                    className="flex items-start gap-3 leading-snug"
                  >
                    <Checkbox
                      checked={draft.categories.includes(category.id)}
                      onCheckedChange={(checked: boolean | 'indeterminate') =>
                        handleCategoryToggle(category.id, checked === true)
                      }
                    />
                    <span>
                      <span className="mb-1 block font-mono text-xs text-muted-foreground">
                        {category.id}
                      </span>
                      {category.name}
                    </span>
                  </Label>
                ))}
              </div>
            </fieldset>
          </div>

          <SheetFooter>
            <Button
              onClick={() => {
                setFilters(draft);
                setOpen(false);
              }}
            >
              Aplicar filtros
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setDraft({
                  ...draft,
                  size: 'all',
                  origin: 'all',
                  categories: CATEGORIES.map((c) => c.id),
                })
              }
            >
              Redefinir seleção
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
