'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, ExternalLink, History, Lock, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ConfirmAction } from '@/shared/components/confirm-action';
import {
  stageLabel,
  type PortfolioChange,
  type PortfolioEntry,
  type PortfolioHistoryEntry,
  type PortfolioMember,
  type PortfolioStage,
} from '../portfolio';
import {
  formatDateTime,
  formatDay,
  MemberAvatar,
  OfficialStatusBadge,
  OfficialStatusNotice,
  StageBadge,
  StageSelect,
} from './portfolio-controls';
import { PortfolioNoteDialog } from './portfolio-note-dialog';

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

function describe(entry: PortfolioHistoryEntry, members: PortfolioMember[]) {
  const name = (id?: string | null) => members.find((item) => item.id === id)?.name ?? 'ninguém';
  switch (entry.action) {
    case 'created': return `adicionou à carteira em “${stageLabel(entry.to ?? '')}”`;
    case 'stage': return `alterou a etapa de “${stageLabel(entry.from ?? '')}” para “${stageLabel(entry.to ?? '')}”`;
    case 'assignee': return entry.to ? `atribuiu a ${name(entry.to)}` : 'removeu o responsável';
    case 'deadline': return entry.to ? `definiu o prazo interno para ${formatDay(entry.to)}` : 'removeu o prazo interno';
    case 'archived': return 'arquivou a oportunidade';
    case 'restored': return 'restaurou a oportunidade';
    case 'note': return entry.from ? 'editou a observação' : 'registrou uma observação';
  }
}

export function PortfolioItemSheet({
  entry,
  members,
  actor,
  canEdit,
  pending,
  onClose,
  onChange,
  onNoteSave,
  onStageRequest,
}: {
  entry: PortfolioEntry | null;
  members: PortfolioMember[];
  actor: PortfolioMember | undefined;
  canEdit: boolean;
  pending: boolean;
  onClose: () => void;
  onChange: (entry: PortfolioEntry, change: PortfolioChange) => void;
  onNoteSave: (entry: PortfolioEntry, text: string) => Promise<boolean>;
  onStageRequest: (entry: PortfolioEntry, stage: PortfolioStage) => void;
}) {
  const [deadlineDraft, setDeadlineDraft] = useState<{ id: string; value: string } | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const editable = canEdit && entry !== null && !entry.archived;
  const deadline = entry && deadlineDraft?.id === entry.id ? deadlineDraft.value : entry?.internalDeadline ?? '';

  return (
    <Sheet open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {entry && (
          <>
            <SheetHeader className="border-b p-5 pr-12">
              <p className="text-xs text-muted-foreground">{entry.opportunity.organization}</p>
              <SheetTitle className="text-lg leading-snug">{entry.opportunity.title}</SheetTitle>
              <SheetDescription>
                {entry.opportunity.modality} · {entry.opportunity.city}/{entry.opportunity.state} · {money(entry.opportunity.estimatedValue)}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">Situação oficial</p>
                  <div className="mt-2"><OfficialStatusBadge status={entry.opportunity.status} /></div>
                  <p className="mt-2 text-[11px] text-muted-foreground">Fonte: {entry.opportunity.source}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">Etapa interna</p>
                  <div className="mt-2"><StageBadge stage={entry.stage} /></div>
                  <p className="mt-2 text-[11px] text-muted-foreground">Organização da empresa</p>
                </div>
              </div>

              <OfficialStatusNotice status={entry.opportunity.status} />

              {entry.archived && (
                <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  Arquivada: não conta como oportunidade ativa do plano. O histórico foi preservado.
                </p>
              )}

              {entry.stage === 'discarded' && entry.discardReason && (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">Motivo do descarte</p>
                  <p className="mt-1">{entry.discardReason}</p>
                </div>
              )}

              {editable ? (
                <section className="space-y-3" aria-label="Organização interna">
                  <label className="block text-xs text-muted-foreground">
                    Etapa interna
                    <StageSelect entry={entry} disabled={pending} className="mt-1 w-full" onRequest={(stage) => onStageRequest(entry, stage)} />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    Responsável
                    <NativeSelect
                      size="sm"
                      className="mt-1 w-full"
                      value={entry.assigneeId ?? ''}
                      disabled={pending}
                      onChange={(event) => onChange(entry, { kind: 'assignee', assigneeId: event.target.value || null })}
                    >
                      <NativeSelectOption value="">Sem responsável</NativeSelectOption>
                      {members.map((item) => (
                        <NativeSelectOption key={item.id} value={item.id}>{item.name} — {item.role}</NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </label>
                  <div className="text-xs text-muted-foreground">
                    <label htmlFor="internal-deadline">Prazo interno</label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        id="internal-deadline"
                        type="date"
                        className="h-8"
                        value={deadline}
                        disabled={pending}
                        onChange={(event) => setDeadlineDraft({ id: entry.id, value: event.target.value })}
                      />
                      <Button
                        variant="outline"
                        disabled={pending || deadline === (entry.internalDeadline ?? '')}
                        onClick={() => {
                          onChange(entry, { kind: 'deadline', deadline: deadline || null });
                          setDeadlineDraft(null);
                        }}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </section>
              ) : (
                <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Responsável</dt>
                  <dd className="flex items-center gap-2">
                    <MemberAvatar member={members.find((item) => item.id === entry.assigneeId)} />
                    {members.find((item) => item.id === entry.assigneeId)?.name ?? 'Sem responsável'}
                  </dd>
                  <dt className="text-muted-foreground">Prazo interno</dt>
                  <dd>{formatDay(entry.internalDeadline)}</dd>
                </dl>
              )}

              {!canEdit && (
                <p className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <Lock className="size-4 shrink-0" />
                  O perfil {actor?.role ?? 'atual'} pode apenas visualizar a carteira.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href={`/oportunidades/${entry.opportunity.id}`}>
                    Ver edital
                    <ExternalLink />
                  </Link>
                </Button>
                {canEdit && !entry.archived && (
                  <Button variant="ghost" disabled={pending} onClick={() => setConfirmArchive(true)}>
                    <Archive />
                    Arquivar
                  </Button>
                )}
                {canEdit && entry.archived && (
                  <Button disabled={pending} onClick={() => onChange(entry, { kind: 'restore' })}>
                    <ArchiveRestore />
                    Restaurar
                  </Button>
                )}
              </div>

              <section className="border-t pt-5" aria-labelledby="portfolio-note-title">
                <div className="flex items-center justify-between gap-3">
                  <h3 id="portfolio-note-title" className="flex items-center gap-2 text-sm font-semibold">
                    <StickyNote className="size-4" />
                    Observação interna
                  </h3>
                  {canEdit && !entry.archived && (
                    <PortfolioNoteDialog
                      key={`${entry.id}-${entry.version}`}
                      entry={entry}
                      disabled={pending}
                      onSave={(text) => onNoteSave(entry, text)}
                    />
                  )}
                </div>
                {entry.note ? (
                  <figure className="mt-3 rounded-lg border bg-muted/40 p-3">
                    <blockquote className="whitespace-pre-wrap break-words text-sm leading-relaxed">{entry.note.text}</blockquote>
                    <figcaption className="mt-2 text-xs text-muted-foreground">
                      {members.find((person) => person.id === entry.note?.authorId)?.name ?? 'Equipe'} ·{' '}
                      <time dateTime={entry.note.updatedAt}>{formatDateTime(entry.note.updatedAt)}</time>
                    </figcaption>
                  </figure>
                ) : (
                  <p className="mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                    Nenhuma observação registrada. Use as notas para combinar próximos passos com a equipe.
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">Privada da empresa: não é publicada nem enviada ao órgão.</p>
              </section>

              <section className="border-t pt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4" />
                  Histórico de mudanças
                </h3>
                <ol className="mt-3 space-y-3">
                  {entry.history.map((item) => (
                    <li key={item.id} className="flex gap-3 text-sm">
                      <MemberAvatar member={members.find((person) => person.id === item.authorId)} />
                      <div className="min-w-0">
                        <p>
                          <b className="font-semibold">{members.find((person) => person.id === item.authorId)?.name ?? 'Sistema'}</b>{' '}
                          {describe(item, members)}
                        </p>
                        {item.note && <p className="mt-0.5 text-xs text-muted-foreground">Motivo: {item.note}</p>}
                        <time className="text-xs text-muted-foreground" dateTime={item.at}>{formatDateTime(item.at)}</time>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <ConfirmAction
              open={confirmArchive}
              onClose={() => setConfirmArchive(false)}
              onConfirm={() => onChange(entry, { kind: 'archive' })}
              title="Arquivar oportunidade?"
              description="Ela deixa de contar como ativa no plano. Etapa, responsável e histórico são preservados e você pode restaurá-la depois."
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
