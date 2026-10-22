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
  Clock3,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  readAllSavedOpportunities,
  removeSavedOpportunity,
} from './saved-opportunities';
import { companyDemoFixture } from './demo-fixture';

import type { Opportunity } from './types';

type View = 'calendar' | 'agenda' | 'kanban';

type AgendaTask = {
  id: string;
  date: string;
  time: string;
  description: string;
};

const AGENDA_STORAGE_KEY = 'monitorame:demo-agenda-tasks';

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


export default function SavedOpportunitiesWorkspace({ initialView = 'calendar' }: { initialView?: View }) {
  const calendarRef = useRef<InstanceType<typeof FullCalendar> | null>(null);
  const [view, setView] = useState<View>(initialView);
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

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

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
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        {view !== 'agenda' && <div className="flex flex-col gap-2 border-b p-2 xl:flex-row xl:items-end">
          <div className="grid flex-1 gap-2 sm:grid-cols-3">
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
        </div>}

        {view === 'kanban' ? (
          <div className="p-4">
            <SavedOpportunitiesKanban />
          </div>
        ) : view === 'agenda' ? (
          <PersonalAgenda />
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 border-r">
              <>
                  <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
                    <Button variant="outline" size="sm" onClick={goToToday}>Hoje</Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => api()?.prev()} aria-label="Mês anterior"><ChevronLeft /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => api()?.next()} aria-label="Próximo mês"><ChevronRight /></Button>
                    <h2 className="text-lg font-semibold capitalize">{title}</h2>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto"><CalendarDays />{pickedDate ? shortDate(pickedDate) : 'Selecionar data'}</Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-auto p-0">
                        <Calendar mode="single" selected={pickedDate} month={pickerMonth} onMonthChange={setPickerMonth} onSelect={goToDate} captionLayout="dropdown" startMonth={new Date(2020, 0)} endMonth={new Date(2035, 11)} />
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
                      dayMaxEvents={3}
                      events={events}
                      dayCellClassNames={(info) => isSameDay(info.date, pickedDate) ? ['picked-date'] : []}
                      datesSet={(info) => { setTitle(info.view.title); setPickerMonth(info.view.currentStart); }}
                      eventClick={(info: EventClickArg) => setSelected(info.event.extendedProps.opportunity)}
                      eventContent={CalendarEventContent}
                    />
                  </div>
              </>
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

function CalendarEventContent({ event, timeText }: EventContentArg) {
  const opportunity = event.extendedProps.opportunity as Opportunity;
  return (
    <div className="min-w-0 p-1">
      <b className="block truncate text-[10px]">{event.title}</b>
      <span className="block truncate text-[10px] opacity-75">{money(opportunity.estimatedValue)}</span>
      {timeText && <span className="block text-[10px] opacity-70">{timeText}</span>}
    </div>
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

function PersonalAgenda() {
  const [tasks, setTasks] = useState<AgendaTask[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => startOfWeek(new Date()));
  const [editingSlot, setEditingSlot] = useState<{ date: string; hour: number; time: string } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const companyName = companyDemoFixture.company.tradeName;
  const days = Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
  const hours = Array.from({ length: 23 }, (_, index) => index + 1);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem(AGENDA_STORAGE_KEY);
        setTasks(saved ? JSON.parse(saved) : []);
      } catch {
        setTasks([]);
      }
    });
  }, []);

  const persist = (next: AgendaTask[]) => {
    setTasks(next);
    localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(next));
  };

  const saveTask = () => {
    if (!editingSlot || !draftTitle.trim()) return;
    const task = {
      id: editingTaskId ?? crypto.randomUUID(),
      date: editingSlot.date,
      time: editingSlot.time,
      description: draftTitle.trim(),
    };
    persist(editingTaskId
      ? tasks.map((item) => item.id === editingTaskId ? task : item)
      : [...tasks, task]);
    setDraftTitle('');
    setEditingSlot(null);
    setEditingTaskId(null);
  };

  const openSlot = (date: Date, hour: number) => {
    setEditingSlot({ date: localDateValue(date), hour, time: `${String(hour).padStart(2, '0')}:00` });
    setEditingTaskId(null);
    setDraftTitle('');
  };

  const openTask = (task: AgendaTask) => {
    setEditingSlot({ date: task.date, hour: Number(task.time.slice(0, 2)), time: task.time });
    setEditingTaskId(task.id);
    setDraftTitle(task.description);
  };

  const closeEditor = () => {
    setEditingSlot(null);
    setEditingTaskId(null);
    setDraftTitle('');
  };

  return (
    <section className="min-w-0" aria-labelledby="agenda-title">
      <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h2 id="agenda-title" className="font-semibold">Agenda da {companyName}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Clique em um horário vazio para incluir uma tarefa. Dados demonstrativos salvos neste navegador.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setStartDate(addDays(startDate, -7))} aria-label="Ver semana anterior">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStartDate(startOfWeek(new Date()))}>Hoje</Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setStartDate(addDays(startDate, 7))} aria-label="Ver próxima semana">
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1180px]">
          <div className="sticky top-0 z-10 grid grid-cols-[5rem_repeat(7,minmax(0,1fr))] border-b bg-card">
            <div className="border-r p-3" />
            {days.map((day) => (
              <div key={localDateValue(day)} className="border-r px-3 py-3 text-center last:border-r-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{formatWeekday(day)}</p>
                <p className="mt-1 text-sm font-semibold">{formatDayHeader(day)}</p>
              </div>
            ))}
          </div>

          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[5rem_repeat(7,minmax(0,1fr))] border-b last:border-b-0">
              <div className="border-r px-2 py-3 text-right text-[10px] text-muted-foreground">{formatHour(hour)}</div>
              {days.map((day) => {
                const dateValue = localDateValue(day);
                const slotTasks = tasks.filter((task) => task.date === dateValue && Number(task.time.slice(0, 2)) === hour);

                return (
                  <div key={`${dateValue}-${hour}`} className="min-h-20 border-r p-1.5 last:border-r-0">
                    {slotTasks.map((task) => (
                      <article
                        key={task.id}
                        role="button"
                        tabIndex={0}
                        className="group mb-1 cursor-pointer rounded-lg border border-primary/15 bg-secondary p-2.5 text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => openTask(task)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openTask(task);
                          }
                        }}
                        aria-label={`Abrir tarefa: ${task.description}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold" title={task.description}>{task.description}</p>
                            <p className="mt-1 flex items-center gap-1 text-[10px] opacity-75"><Clock3 className="size-3" />{task.time} · {companyName}</p>
                          </div>
                          <Button variant="ghost" size="icon-xs" className="size-6 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" onClick={(event) => { event.stopPropagation(); persist(tasks.filter((item) => item.id !== task.id)); }} aria-label={`Excluir tarefa: ${task.description}`}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </article>
                    ))}

                    {slotTasks.length === 0 && (
                      <button type="button" className="min-h-14 w-full rounded-md text-left text-xs text-transparent transition-colors hover:bg-muted/60 hover:text-muted-foreground focus-visible:bg-muted/60 focus-visible:text-muted-foreground" onClick={() => openSlot(day, hour)} aria-label={`Adicionar tarefa em ${formatDayHeader(day)} às ${formatHour(hour)}`}>
                        <span className="inline-flex items-center gap-1 px-2"><Plus className="size-3" /> Adicionar tarefa</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={editingSlot !== null} onOpenChange={(open) => { if (!open) closeEditor(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTaskId ? 'Editar tarefa' : 'Adicionar tarefa'}</DialogTitle>
            <DialogDescription>
              {editingTaskId ? 'Altere as informações do evento e salve novamente.' : `Novo evento para a agenda da ${companyName}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {editingSlot && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
                <CalendarDays className="size-4 text-primary" />
                <span className="font-medium">{formatAgendaSlot(editingSlot.date, editingSlot.time)}</span>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="agenda-task-title">Título</Label>
              <Input
                id="agenda-task-title"
                autoFocus
                value={draftTitle}
                maxLength={48}
                placeholder="Ex.: Revisar documentos do edital"
                onChange={(event) => setDraftTitle(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') saveTask(); }}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{companyName}</span><span>{draftTitle.length}/48</span>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditor}>Cancelar</Button>
            <Button type="button" onClick={saveTask} disabled={!draftTitle.trim() || !editingSlot?.date}>
              {editingTaskId ? 'Salvar alterações' : 'Salvar tarefa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function localDateValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(+date - offset * 60000).toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = startOfDay(date);
  return addDays(day, -day.getDay());
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '');
}

function formatDayHeader(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date).replace('.', '');
}

function formatHour(hour: number) {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, '0')} ${period}`;
}

function formatAgendaSlot(dateValue: string, time: string) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const hour = Number(time.slice(0, 2));
  return `${new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date)}, às ${formatHour(hour)}`;
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
