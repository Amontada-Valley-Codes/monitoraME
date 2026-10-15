'use client';
/* eslint-disable react-hooks/set-state-in-effect -- saved opportunities are hydrated from localStorage after mount. */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import {
  BookmarkX,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Columns3,
  ExternalLink,
  List,
  MapPin,
  RotateCcw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import SavedOpportunitiesKanban from '@/components/shadcn-studio/kanban/kanban-04';

import {
  emptyOpportunityPipeline,
  readAllSavedOpportunities,
  removeSavedOpportunity,
  SAVED_PIPELINE_KEY,
} from './saved-opportunities';

import type { Opportunity } from './types';

type View = 'calendar' | 'agenda' | 'kanban';

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  classNames: string[];
  extendedProps: {
    opportunity: Opportunity;
    kind: 'deadline' | 'opening';
  };
};

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

const shortDate = (value: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(value);

const isSameDay = (left: Date, right: Date | undefined) =>
  right !== undefined &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();


const dateTime = (value: string | null | undefined) => {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};


export default function SavedOpportunitiesWorkspace() {
  const calendarRef = useRef<InstanceType<typeof FullCalendar> | null>(null);

  const [view, setView] = useState<View>('calendar');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [title, setTitle] = useState('');

  const [status, setStatus] = useState('all');
  const [modality, setModality] = useState('all');
  const [organization, setOrganization] = useState('all');

  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date>();
  const [pickerMonth, setPickerMonth] = useState<Date>();

  useEffect(() => {
    const items = readAllSavedOpportunities();
    const today = new Date();

    setOpportunities(items);
    setSelected(items[0] ?? null);
    setNow(today.getTime());
    setPickedDate(today);
    setPickerMonth(today);
    setLoaded(true);
  }, []);

  const filtered = useMemo(
    () =>
      opportunities.filter((item) => {
        const deadline = new Date(item.closingDate).getTime();

        const statusMatch =
          status === 'all' ||
          now === null ||
          (status === 'expired' ? deadline < now : deadline >= now);

        return (
          statusMatch &&
          (modality === 'all' || item.modality === modality) &&
          (organization === 'all' || item.organization === organization)
        );
      }),
    [opportunities, status, modality, organization, now],
  );

  const events = useMemo<CalendarEvent[]>(
    () =>
      filtered.flatMap((item) =>
        [
          {
            id: `${item.id}:deadline`,
            title: `Prazo · ${item.modality}`,
            start: item.closingDate,
            classNames: ['deadline-event'],
            extendedProps: {
              opportunity: item,
              kind: 'deadline' as const,
            },
          },
          {
            id: `${item.id}:opening`,
            title: `Abertura · ${item.modality}`,
            start: item.openingDate,
            classNames: ['opening-event'],
            extendedProps: {
              opportunity: item,
              kind: 'opening' as const,
            },
          },
        ].filter(
          (event) => !Number.isNaN(new Date(event.start).getTime()),
        ),
      ),
    [filtered],
  );

  const week = 7 * 86400000;

  const preparing = (() => {
    if (typeof window === 'undefined') return 0;

    try {
      const raw = localStorage.getItem(SAVED_PIPELINE_KEY);

      return raw
        ? {
            ...emptyOpportunityPipeline(),
            ...JSON.parse(raw),
          }.preparing.length
        : 0;
    } catch {
      return 0;
    }
  })();

  const stats = {
    total: opportunities.length,
    near:
      now === null
        ? 0
        : opportunities.filter((item) => {
            const time = new Date(item.closingDate).getTime();
            return time >= now && time <= now + week;
          }).length,
    preparing,
    expired:
      now === null
        ? 0
        : opportunities.filter(
            (item) => new Date(item.closingDate).getTime() < now,
          ).length,
  };

  const clearFilters = () => {
    setStatus('all');
    setModality('all');
    setOrganization('all');
  };

  const removeSelected = () => {
    if (!selected) return;

    removeSavedOpportunity(selected.id);

    const next = opportunities.filter(
      (item) => item.id !== selected.id,
    );

    setOpportunities(next);
    setSelected(next[0] ?? null);
  };

  const api = () => calendarRef.current?.getApi();

  const goToDate = (date: Date | undefined) => {
    if (!date) return;

    setPickedDate(date);
    setPickerMonth(date);
    api()?.gotoDate(date);
    setDatePickerOpen(false);
  };

  const goToToday = () => {
    const today = new Date();

    setPickedDate(today);
    setPickerMonth(today);
    api()?.today();
    setDatePickerOpen(false);
  };

  if (!loaded) {
    return (
      <div className="h-[38rem] animate-pulse rounded-xl bg-muted" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Editais salvos" value={stats.total} />
        <Stat label="Prazos nos próximos 7 dias" value={stats.near} />
        <Stat label="Propostas em preparação" value={stats.preparing} />
        <Stat label="Prazos vencidos" value={stats.expired} />
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <div className="flex flex-col gap-2 border-b p-2 xl:flex-row xl:items-end">
          <div className="flex flex-wrap gap-1">
            <ViewButton
              active={view === 'calendar'}
              onClick={() => setView('calendar')}
              icon={CalendarDays}
            >
              Calendário
            </ViewButton>

            <ViewButton
              active={view === 'agenda'}
              onClick={() => setView('agenda')}
              icon={List}
            >
              Agenda
            </ViewButton>

            <ViewButton
              active={view === 'kanban'}
              onClick={() => setView('kanban')}
              icon={Columns3}
            >
              Kanban
            </ViewButton>
          </div>

          <div className="grid flex-1 gap-2 border-t pt-2 sm:grid-cols-3 xl:border-l xl:border-t-0 xl:pl-2 xl:pt-0">
            <Filter
              label="Situação"
              value={status}
              onChange={setStatus}
              options={[
                ['all', 'Todas'],
                ['active', 'Em andamento'],
                ['expired', 'Prazo vencido'],
              ]}
            />

            <Filter
              label="Modalidade"
              value={modality}
              onChange={setModality}
              options={[
                ['all', 'Todas'],
                ...Array.from(
                  new Set(opportunities.map((item) => item.modality)),
                ).map((value) => [value, value]),
              ]}
            />

            <Filter
              label="Órgão"
              value={organization}
              onChange={setOrganization}
              options={[
                ['all', 'Todos'],
                ...Array.from(
                  new Set(opportunities.map((item) => item.organization)),
                ).map((value) => [value, value]),
              ]}
            />
          </div>

          <Button
            variant="ghost"
            className="h-9 min-h-9! shrink-0 self-end"
            onClick={clearFilters}
          >
            <RotateCcw className="size-4" />
            Limpar filtros
          </Button>
        </div>

        {view === 'kanban' ? (
          <div className="p-4">
            <SavedOpportunitiesKanban />
          </div>
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 border-r">
              {view === 'calendar' ? (
                <>
                  <div className="flex items-center gap-2 border-b p-2 px-4">
                    <Button
                      className="h-8 min-h-8! rounded-sm"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => api()?.prev()}
                    >
                      <ChevronLeft />
                      <span className="sr-only">Mês anterior</span>
                    </Button>

                    <Button
                      className="h-8 min-h-8! rounded-sm"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => api()?.next()}
                    >
                      <ChevronRight />
                      <span className="sr-only">Próximo mês</span>
                    </Button>

                    <h2 className="ml-2 text-lg font-semibold capitalize">
                      {title}
                    </h2>

                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="default"
                          className="ml-auto h-8 min-h-8! rounded-sm"
                        >
                          <CalendarDays className="size-4" />
                          {pickedDate ? shortDate(pickedDate) : 'Selecionar data'}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent align="end" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={pickedDate}
                          month={pickerMonth}
                          onMonthChange={setPickerMonth}
                          onSelect={goToDate}
                          captionLayout="dropdown"
                          startMonth={new Date(2020, 0)}
                          endMonth={new Date(2035, 11)}
                          className="rounded-lg"
                        />

                        <div className="border-t p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={goToToday}
                          >
                            Ir para hoje
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="saved-calendar p-2 sm:p-4">
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin]}
                      initialView="dayGridMonth"
                      locale={ptBrLocale}
                      firstDay={1}
                      headerToolbar={false}
                      height="auto"
                      dayMaxEvents={2}
                      events={events}
                      dayCellClassNames={(info) =>
                        isSameDay(info.date, pickedDate) ? ['picked-date'] : []
                      }
                      datesSet={(info) => {
                        setTitle(info.view.title);
                        setPickerMonth(info.view.currentStart);
                      }}
                      eventClick={(info: EventClickArg) => {
                        setSelected(info.event.extendedProps.opportunity);
                      }}
                      eventContent={CalendarEventContent}
                    />
                  </div>
                </>
              ) : (
                <Agenda events={events} onSelect={setSelected} />
              )}
            </div>

            <Details
              opportunity={selected}
              onRemove={removeSelected}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function CalendarEventContent({
  event,
  timeText,
}: EventContentArg) {
  const opportunity = event.extendedProps.opportunity as Opportunity;

  return (
    <div className="min-w-0 p-1">
      <b className="block truncate text-[10px]">{event.title}</b>

      <span className="block truncate text-[10px] opacity-75">
        {money(opportunity.estimatedValue)}
      </span>

      {timeText && (
        <span className="block text-[10px] opacity-70">
          {timeText}
        </span>
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CalendarDays;
  children: string;
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      className="h-9 min-h-9! rounded-md"
      onClick={onClick}
    >
      <Icon className="size-4" />
      {children}
    </Button>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card className="gap-1 p-4 shadow-none">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong className="text-2xl text-foreground">{value}</strong>
    </Card>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}

      <NativeSelect
        className="mt-1 h-9 min-h-9! w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([key, text]) => (
          <NativeSelectOption key={key} value={key}>
            {text}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}

function Agenda({
  events,
  onSelect,
}: {
  events: CalendarEvent[];
  onSelect: (item: Opportunity) => void;
}) {
  return (
    <div className="divide-y">
      {[...events]
        .sort((a, b) => +new Date(a.start) - +new Date(b.start))
        .map((event) => (
          <button
            key={event.id}
            className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/40"
            onClick={() => onSelect(event.extendedProps.opportunity)}
          >
            <span className="w-28 shrink-0 text-xs text-muted-foreground">
              {dateTime(event.start)}
            </span>

            <span className="min-w-0">
              <b className="block truncate text-sm">{event.title}</b>
              <span className="text-xs text-muted-foreground">
                {event.extendedProps.opportunity.organization}
              </span>
            </span>
          </button>
        ))}
    </div>
  );
}

function Details({
  opportunity,
  onRemove,
}: {
  opportunity: Opportunity | null;
  onRemove: () => void;
}) {
  if (!opportunity) {
    return (
      <aside className="grid min-h-80 place-items-center p-8 text-center text-sm text-muted-foreground">
        Selecione um evento ou edital para ver os detalhes.
      </aside>
    );
  }

  return (
    <aside className="min-w-0 p-4 sm:p-5">
      <Badge variant="secondary">{opportunity.modality}</Badge>

      <h2 className="mt-4 text-lg font-bold leading-snug">
        {opportunity.title}
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        {opportunity.organization}
      </p>

      <dl className="mt-6 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-3 text-xs">
        <dt className="text-muted-foreground">Órgão</dt>
        <dd className="break-words">{opportunity.organization}</dd>

        <dt className="text-muted-foreground">Modalidade</dt>
        <dd className="break-words">{opportunity.modality}</dd>

        <dt className="text-muted-foreground">Valor estimado</dt>
        <dd>{money(opportunity.estimatedValue)}</dd>

        <dt className="text-muted-foreground">Abertura</dt>
        <dd>{dateTime(opportunity.openingDate)}</dd>

        <dt className="text-muted-foreground">Envio de propostas</dt>
        <dd>{dateTime(opportunity.closingDate)}</dd>

        <dt className="text-muted-foreground">Localidade</dt>
        <dd className="flex items-center gap-1 break-words">
          <MapPin className="size-3 shrink-0" />
          {opportunity.city}/{opportunity.state}
        </dd>
      </dl>

      <div className="mt-6 grid grid-cols-2 items-stretch gap-2">
        <Button asChild className="min-w-0 px-2">
          <Link
            href={`/oportunidades/${opportunity.id}`}
            className="flex min-w-0 items-center justify-center gap-1.5 text-center text-xs sm:text-sm"
          >
            <span className="truncate">Acessar edital</span>
            <ExternalLink className="size-3.5 shrink-0 sm:size-4" />
          </Link>
        </Button>

        <Button
          variant="outline"
          className="min-w-0 gap-1.5 px-2 text-xs sm:text-sm"
          onClick={onRemove}
        >
          <BookmarkX className="size-3.5 shrink-0 sm:size-4" />
          <span className="truncate">Remover dos salvos</span>
        </Button>
      </div>

      <div className="mt-6 border-t pt-5">
        <h3 className="text-sm font-semibold">Sobre o edital</h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {opportunity.description}
        </p>
      </div>
    </aside>
  );
}
