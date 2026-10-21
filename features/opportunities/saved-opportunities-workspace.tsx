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
  Columns3,
  ExternalLink,
  List,
  MapPin,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [date, setDate] = useState<Date>(() => new Date());
  const [time, setTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [draftHour, setDraftHour] = useState('09');
  const [draftMinute, setDraftMinute] = useState('00');
  const [clockMode, setClockMode] = useState<'hour' | 'minute'>('hour');
  const [message, setMessage] = useState('');

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

  const addTask = () => {
    if (!description.trim()) {
      setMessage('Escreva uma descrição para a tarefa.');
      return;
    }

    persist([
      ...tasks,
      {
        id: crypto.randomUUID(),
        date: localDateValue(date),
        time,
        description: description.trim(),
      },
    ]);
    setDescription('');
    setMessage('Tarefa adicionada à agenda.');
  };

  const sortedTasks = [...tasks].sort((left, right) =>
    `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`),
  );

  const openTimePicker = () => {
    const [hour, minute] = time.split(':');
    setDraftHour(hour);
    setDraftMinute(minute);
    setClockMode('hour');
    setTimeOpen(true);
  };

  const confirmTime = () => {
    const hour = Math.min(23, Math.max(0, Number(draftHour) || 0));
    const minute = Math.min(59, Math.max(0, Number(draftMinute) || 0));
    setTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    setTimeOpen(false);
  };

  return (
    <div className="grid min-h-[32rem] xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 border-r" aria-labelledby="agenda-title">
        <div className="border-b px-4 py-4">
          <h2 id="agenda-title" className="font-semibold">Minha agenda</h2>
          <p className="mt-1 text-xs text-muted-foreground">Anotações pessoais para organizar suas tarefas. Dados demonstrativos.</p>
        </div>

        {sortedTasks.length ? (
          <div className="divide-y">
            {sortedTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-4 p-4">
                <div className="w-28 shrink-0">
                  <span className="block text-xs font-medium text-primary">{formatAgendaDate(task.date)}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{task.time}</span>
                </div>
                <p className="min-w-0 flex-1 text-sm leading-relaxed">{task.description}</p>
                <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => persist(tasks.filter((item) => item.id !== task.id))} aria-label={`Excluir tarefa: ${task.description}`}><Trash2 /></Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div><CalendarDays className="mx-auto size-8 text-muted-foreground/60" /><p className="mt-3 text-sm font-medium">Nenhuma tarefa anotada</p><p className="mt-1 text-xs text-muted-foreground">Use o formulário ao lado para criar sua primeira anotação.</p></div>
          </div>
        )}
      </section>

      <aside className="min-w-0 p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Adicionar tarefa</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Escolha o dia e o horário para lembrar desta atividade.</p>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-2">
            <Label>Dia</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild><Button variant="outline" className="justify-start font-normal"><CalendarDays />{formatSelectedDate(date)}</Button></PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(value) => { if (value) { setDate(value); setDateOpen(false); } }} /></PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Horário</Label>
            <Button type="button" variant="outline" className="justify-start font-normal" onClick={openTimePicker}><Clock3 />{time}</Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="agenda-description">Descrição</Label>
            <Textarea id="agenda-description" value={description} onChange={(event) => { setDescription(event.target.value); setMessage(''); }} rows={5} placeholder="Ex.: Revisar os documentos do edital antes do prazo." />
          </div>

          {message && <p className="text-xs text-muted-foreground" role="status">{message}</p>}

          <Button onClick={addTask}><Plus />Adicionar à agenda</Button>
        </div>
      </aside>

      <Dialog open={timeOpen} onOpenChange={setTimeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Escolher horário</DialogTitle>
            <DialogDescription>Informe a hora e os minutos exatos da tarefa.</DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="mb-4 flex items-center justify-center text-3xl font-semibold tabular-nums" aria-live="polite">
              <button type="button" className={clockMode === 'hour' ? 'text-primary' : 'text-muted-foreground'} onClick={() => setClockMode('hour')}>{draftHour.padStart(2, '0')}</button>
              <span className="px-1 text-muted-foreground">:</span>
              <button type="button" className={clockMode === 'minute' ? 'text-primary' : 'text-muted-foreground'} onClick={() => setClockMode('minute')}>{draftMinute.padStart(2, '0')}</button>
            </div>

            <AnalogClock
              mode={clockMode}
              hour={Number(draftHour)}
              minute={Number(draftMinute)}
              onHourChange={(value) => {
                setDraftHour(String(value).padStart(2, '0'));
                setClockMode('minute');
              }}
              onMinuteChange={(value) => setDraftMinute(String(value).padStart(2, '0'))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTimeOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={confirmTime}>Confirmar horário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnalogClock({ mode, hour, minute, onHourChange, onMinuteChange }: { mode: 'hour' | 'minute'; hour: number; minute: number; onHourChange: (value: number) => void; onMinuteChange: (value: number) => void }) {
  const [afternoon, setAfternoon] = useState(hour >= 12);
  const values = mode === 'hour'
    ? Array.from({ length: 12 }, (_, index) => index + (afternoon ? 12 : 0))
    : Array.from({ length: 12 }, (_, index) => index * 5);
  const activeIndex = mode === 'hour' ? hour % 12 : Math.round(minute / 5) % 12;

  return (
    <div>
      {mode === 'hour' && (
        <div className="mb-3 flex justify-center gap-1" aria-label="Período do dia">
          <Button type="button" size="sm" variant={!afternoon ? 'default' : 'outline'} onClick={() => setAfternoon(false)}>00–11</Button>
          <Button type="button" size="sm" variant={afternoon ? 'default' : 'outline'} onClick={() => setAfternoon(true)}>12–23</Button>
        </div>
      )}

      <div className="relative mx-auto size-64 rounded-full bg-muted/70 shadow-inner" role="group" aria-label={mode === 'hour' ? 'Escolher hora no relógio' : 'Escolher minutos no relógio'}>
        <span className="absolute left-1/2 top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-[5.25rem] origin-left bg-primary transition-transform"
          style={{ transform: `rotate(${activeIndex * 30 - 90}deg)` }}
        />

        {values.map((value, index) => {
          const angle = index * 30 - 90;
          const radians = angle * Math.PI / 180;
          const x = 128 + Math.cos(radians) * 102;
          const y = 128 + Math.sin(radians) * 102;
          const active = index === activeIndex;
          return (
            <button
              key={value}
              type="button"
              className={`absolute z-20 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-background'}`}
              style={{ left: x, top: y }}
              onClick={() => mode === 'hour' ? onHourChange(value) : onMinuteChange(value)}
              aria-label={mode === 'hour' ? `${value} horas` : `${value} minutos`}
            >
              {String(value).padStart(2, '0')}
            </button>
          );
        })}
      </div>

      {mode === 'minute' && <p className="mt-3 text-center text-xs text-muted-foreground">Selecione os minutos em intervalos de 5.</p>}
    </div>
  );
}

function localDateValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(+date - offset * 60000).toISOString().slice(0, 10);
}

function formatAgendaDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(year, month - 1, day));
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' }).format(date);
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
