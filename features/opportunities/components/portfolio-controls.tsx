'use client';

import { useState } from 'react';
import { Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DISCARD_REASON_MIN,
  PORTFOLIO_STAGES,
  isOfficiallyInterrupted,
  officialStatusLabel,
  stageBlockReason,
  stageLabel,
  type PortfolioEntry,
  type PortfolioMember,
  type PortfolioStage,
} from '../portfolio';
import type { Opportunity } from '../types';

const stageTone = Object.fromEntries(PORTFOLIO_STAGES.map((stage) => [stage.id, stage.tone])) as Record<PortfolioStage, string>;

export const formatDay = (value: string | null) =>
  value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Sem prazo';

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export function StageBadge({ stage, className }: { stage: PortfolioStage; className?: string }) {
  const tone = stageTone[stage];
  return (
    <Badge
      variant="secondary"
      className={cn(
        'max-w-full truncate',
        tone === 'progress' && 'bg-primary/10 text-primary',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'closed' && 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {stageLabel(stage)}
    </Badge>
  );
}

export function OfficialStatusBadge({ status }: { status: Opportunity['status'] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        status === 'suspended' && 'border-warning/30 bg-warning-soft text-warning',
        (status === 'revoked' || status === 'cancelled') && 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
    >
      <Landmark aria-hidden />
      {officialStatusLabel[status]}
    </Badge>
  );
}

export function MemberAvatar({ member }: { member?: PortfolioMember }) {
  const initials = member ? member.name.split(' ').map((part) => part[0]).slice(0, 2).join('') : '—';
  return (
    <span
      title={member?.name ?? 'Sem responsável'}
      className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground"
    >
      {initials}
    </span>
  );
}

export function StageSelect({
  entry,
  disabled,
  onRequest,
  className,
}: {
  entry: PortfolioEntry;
  disabled?: boolean;
  onRequest: (stage: PortfolioStage) => void;
  className?: string;
}) {
  return (
    <NativeSelect
      size="sm"
      aria-label={`Etapa interna de ${entry.opportunity.title}`}
      className={className}
      value={entry.stage}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onRequest(event.target.value as PortfolioStage)}
    >
      {PORTFOLIO_STAGES.map((stage) => {
        const blocked = stageBlockReason(entry.opportunity.status, stage.id) !== null;
        return (
          <NativeSelectOption key={stage.id} value={stage.id} disabled={blocked && stage.id !== entry.stage}>
            {stage.label}
            {blocked && stage.id !== entry.stage ? ' (bloqueada)' : ''}
          </NativeSelectOption>
        );
      })}
    </NativeSelect>
  );
}

export function OfficialStatusNotice({ status }: { status: Opportunity['status'] }) {
  if (!isOfficiallyInterrupted(status)) return null;
  return (
    <p
      role="status"
      className={cn(
        'rounded-lg p-3 text-xs font-medium',
        status === 'suspended' ? 'bg-warning-soft text-warning' : 'bg-destructive/10 text-destructive',
      )}
    >
      {status === 'suspended'
        ? 'Situação oficial: suspensa. Os dados internos foram mantidos; etapas de participação e resultado ficam bloqueadas até a retomada.'
        : `Situação oficial: ${officialStatusLabel[status].toLowerCase()}. Os dados internos foram mantidos; só é possível descartar ou registrar resultado não confirmado.`}
    </p>
  );
}

/** Confirmações obrigatórias: motivo do descarte e envio manual da proposta. */
export function StageChangeDialog({
  request,
  onCancel,
  onConfirm,
}: {
  request: { entry: PortfolioEntry; stage: 'discarded' | 'submitted' } | null;
  onCancel: () => void;
  onConfirm: (data: { discardReason?: string; submissionConfirmed?: boolean }) => void;
}) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [touched, setTouched] = useState(false);
  const discard = request?.stage === 'discarded';
  const reasonValid = reason.trim().length >= DISCARD_REASON_MIN;
  const valid = discard ? reasonValid : confirmed;

  const close = () => {
    setReason('');
    setConfirmed(false);
    setTouched(false);
    onCancel();
  };
  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onConfirm(discard ? { discardReason: reason.trim() } : { submissionConfirmed: true });
    setReason('');
    setConfirmed(false);
    setTouched(false);
  };

  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{discard ? 'Descartar oportunidade' : 'Confirmar envio da proposta'}</DialogTitle>
          <DialogDescription>{request?.entry.opportunity.title}</DialogDescription>
        </DialogHeader>

        {discard ? (
          <div className="space-y-2">
            <label htmlFor="discard-reason" className="text-sm font-medium">
              Motivo do descarte
            </label>
            <Textarea
              id="discard-reason"
              value={reason}
              maxLength={500}
              aria-invalid={touched && !reasonValid}
              aria-describedby="discard-reason-hint"
              placeholder="Ex.: exigência de atestado incompatível com o porte da empresa."
              onChange={(event) => setReason(event.target.value)}
            />
            <p id="discard-reason-hint" className={cn('text-xs', touched && !reasonValid ? 'text-destructive' : 'text-muted-foreground')}>
              Obrigatório, mínimo de {DISCARD_REASON_MIN} caracteres. O motivo fica registrado no histórico.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              O MonitoraME não envia propostas. Marque esta etapa somente depois de concluir o envio no portal oficial.
            </p>
            <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={confirmed}
                aria-invalid={touched && !confirmed}
                onCheckedChange={(value) => setConfirmed(value === true)}
                className="mt-0.5"
              />
              Confirmo que a proposta foi enviada no portal oficial.
            </label>
            {touched && !confirmed && <p className="text-xs text-destructive">A confirmação manual é obrigatória.</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>Cancelar</Button>
          <Button variant={discard ? 'destructive' : 'default'} onClick={submit}>
            {discard ? 'Descartar' : 'Confirmar envio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
