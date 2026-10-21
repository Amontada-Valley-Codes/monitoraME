'use client';

import { CalendarClock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PORTFOLIO_STAGES,
  isOfficiallyInterrupted,
  type PortfolioEntry,
  type PortfolioMember,
  type PortfolioStage,
} from '../portfolio';
import { formatDay, MemberAvatar, OfficialStatusBadge, StageBadge, StageSelect } from './portfolio-controls';

type ViewProps = {
  entries: PortfolioEntry[];
  members: PortfolioMember[];
  canEdit: boolean;
  pendingIds: Set<string>;
  today: string;
  onOpen: (entry: PortfolioEntry) => void;
  onStageRequest: (entry: PortfolioEntry, stage: PortfolioStage) => void;
};

const member = (members: PortfolioMember[], id: string | null) => members.find((item) => item.id === id);

function Deadline({ value, today }: { value: string | null; today: string }) {
  const overdue = value !== null && value < today;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', overdue ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
      <CalendarClock className="size-3.5" aria-hidden />
      {formatDay(value)}
      {overdue && <span className="sr-only">(prazo vencido)</span>}
    </span>
  );
}

export function PortfolioList({ entries, members, canEdit, pendingIds, today, onOpen, onStageRequest }: ViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Oportunidade</th>
            <th className="px-3 py-3 font-medium">Situação oficial</th>
            <th className="px-3 py-3 font-medium">Etapa interna</th>
            <th className="px-3 py-3 font-medium">Responsável</th>
            <th className="px-3 py-3 font-medium">Prazo interno</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-muted/40"
              onClick={() => onOpen(entry)}
            >
              <td className="max-w-[320px] px-4 py-3">
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(entry);
                  }}
                >
                  <span className="block truncate font-semibold">{entry.opportunity.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {entry.opportunity.organization} · {entry.opportunity.city}/{entry.opportunity.state}
                  </span>
                </button>
              </td>
              <td className="px-3 py-3"><OfficialStatusBadge status={entry.opportunity.status} /></td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  {canEdit && !entry.archived ? (
                    <StageSelect entry={entry} disabled={pendingIds.has(entry.id)} onRequest={(stage) => onStageRequest(entry, stage)} />
                  ) : (
                    <StageBadge stage={entry.stage} />
                  )}
                  {pendingIds.has(entry.id) && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Salvando" />}
                </div>
              </td>
              <td className="px-3 py-3">
                <span className="flex items-center gap-2 text-xs">
                  <MemberAvatar member={member(members, entry.assigneeId)} />
                  {member(members, entry.assigneeId)?.name ?? 'Sem responsável'}
                </span>
              </td>
              <td className="px-3 py-3"><Deadline value={entry.internalDeadline} today={today} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortfolioBoard({ entries, members, pendingIds, today, onOpen }: ViewProps) {
  return (
    <div className="flex gap-3 overflow-x-auto p-4" role="list" aria-label="Quadro por etapa interna">
      {PORTFOLIO_STAGES.map((stage) => {
        const items = entries.filter((entry) => entry.stage === stage.id);
        return (
          <section key={stage.id} role="listitem" className="flex w-64 shrink-0 flex-col rounded-xl bg-muted/50 p-2">
            <header className="flex items-center justify-between gap-2 px-1 pb-2">
              <h3 className="truncate text-xs font-semibold" title={stage.label}>{stage.label}</h3>
              <span className="rounded-full bg-background px-2 text-[11px] text-muted-foreground">{items.length}</span>
            </header>
            <div className="flex min-h-24 flex-col gap-2">
              {items.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onOpen(entry)}
                  className={cn(
                    'rounded-lg border bg-card p-3 text-left shadow-xs transition hover:border-primary/40',
                    isOfficiallyInterrupted(entry.opportunity.status) && 'border-warning/40',
                    pendingIds.has(entry.id) && 'opacity-60',
                  )}
                >
                  <span className="line-clamp-2 text-sm font-semibold leading-snug">{entry.opportunity.title}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{entry.opportunity.organization}</span>
                  {entry.opportunity.status !== 'open' && (
                    <span className="mt-2 block"><OfficialStatusBadge status={entry.opportunity.status} /></span>
                  )}
                  <span className="mt-3 flex items-center justify-between gap-2">
                    <Deadline value={entry.internalDeadline} today={today} />
                    <MemberAvatar member={member(members, entry.assigneeId)} />
                  </span>
                </button>
              ))}
              {!items.length && <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">Nenhuma oportunidade</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
