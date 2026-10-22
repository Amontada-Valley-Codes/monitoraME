'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Building2,
  FileX2,
  Loader2,
  Lock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getAccessRequestErrorMessage,
  rejectAccessRequest,
} from '../access-requests.service';

export interface RejectAccessDialogProps {
  requestId: string;
  companyName: string;
  cnpj?: string;
  protocol?: string;
  locationLabel?: string;
  disabled?: boolean;
  onSuccess?: (requestId: string, reason: string) => void;
}

const LIGHT_SURFACE_VARS = {
  '--background': '#f8fafc',
  '--card': '#ffffff',
  '--card-foreground': '#102c55',
  '--foreground': '#102c55',
  '--muted': '#f1f5f9',
  '--muted-foreground': '#64748b',
  '--border': '#e2e8f0',
  '--input': '#cbd5e1',
  colorScheme: 'light',
} as React.CSSProperties;

export function RejectAccessDialog({
  requestId,
  companyName,
  cnpj,
  protocol,
  locationLabel,
  disabled = false,
  onSuccess,
}: RejectAccessDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length > 0;
  const textareaId = React.useId();

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setReason('');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isReasonValid || isSubmitting) {
      if (!isReasonValid) {
        toast.error('Motivo obrigatório', {
          description: 'Informe a justificativa técnica antes de confirmar a rejeição.',
        });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await rejectAccessRequest(requestId, {
        reason: trimmedReason,
        review_comment: trimmedReason,
      });

      toast.success('Solicitação rejeitada', {
        description: `O indeferimento de ${companyName} foi registado com sucesso.`,
      });
      setOpen(false);
      setReason('');
      onSuccess?.(requestId, trimmedReason);
      router.refresh();
    } catch (error) {
      const message = getAccessRequestErrorMessage(
        error,
        `Não foi possível rejeitar a solicitação de ${companyName}.`,
      );
      toast.error('Falha ao rejeitar solicitação', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isSubmitting}
          className="h-9 gap-1.5 rounded-lg border-[#fecaca] bg-[#ffffff] px-3.5 text-xs font-semibold text-[#dc2626] transition-colors hover:border-[#fca5a5] hover:bg-[#fef2f2] hover:text-[#b91c1c] disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <XCircle className="size-3.5" aria-hidden="true" />
          )}
          Rejeitar
        </Button>
      </DialogTrigger>

      <DialogContent
        style={LIGHT_SURFACE_VARS}
        className="max-w-lg gap-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#ffffff] p-0 text-[#102c55] shadow-[0_24px_60px_-15px_rgb(16_44_85/22%)]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
          {/* 1. Cabeçalho */}
          <DialogHeader className="border-b border-[#e2e8f0] bg-[#f8fafc] p-6 text-left">
            <div className="flex items-start gap-3.5 pr-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#fecaca] bg-[#fef2f2] text-[#dc2626]">
                <FileX2 className="size-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] text-[#dc2626] uppercase">
                  Governança & Credenciamento • Indeferimento
                </span>
                <DialogTitle className="text-base font-bold text-[#102c55]">
                  Rejeitar solicitação de {companyName}
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-[#64748b]">
                  Registe o parecer técnico que fundamenta a recusa da habilitação empresarial.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* 2. Corpo */}
          <div className="space-y-4 bg-[#ffffff] p-6">
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#ffffff] text-[#1560bd]">
                    <Building2 className="size-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold leading-snug text-[#102c55]">{companyName}</p>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#64748b]">
                      {cnpj && <span className="data-value font-mono">CNPJ: {cnpj}</span>}
                      {locationLabel && <span>• {locationLabel}</span>}
                      {protocol && <span className="data-value font-mono">• {protocol}</span>}
                    </div>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#fde68a] bg-[#fffbeb] px-2.5 py-0.5 text-xs font-semibold text-[#b45309]">
                  <span className="size-1.5 rounded-full bg-[#f59e0b]" aria-hidden="true" />
                  Em Revisão
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label
                  htmlFor={textareaId}
                  className="text-xs font-bold tracking-wider text-[#102c55] uppercase"
                >
                  Motivo da Rejeição <span className="text-[#dc2626]">*</span>
                </Label>
                <span className="rounded border border-[#fecaca] bg-[#fef2f2] px-2 py-0.5 text-[11px] font-semibold text-[#dc2626]">
                  Obrigatório para notificação ao fornecedor
                </span>
              </div>

              <Textarea
                id={textareaId}
                required
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={isSubmitting}
                placeholder="Descreva objetivamente a divergência documental ou cadastral identificada (ex: Contrato Social desatualizado ou documento de identificação ilegível)..."
                className="rounded-xl border-[#cbd5e1] bg-[#ffffff] text-sm text-[#102c55] placeholder:text-[#94a3b8] focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626]/20"
              />
            </div>

            <div className="rounded-r-xl border border-[#fde68a] border-l-4 border-l-[#f7931e] bg-[#fffbeb] p-3.5">
              <h4 className="mb-1 flex items-center gap-2 text-xs font-bold text-[#92400e]">
                <AlertTriangle className="size-4 shrink-0 text-[#f7931e]" aria-hidden="true" />
                Transparência do Indeferimento
              </h4>
              <p className="text-xs leading-relaxed text-[#78350f]">
                Esta justificativa ficará visível no acompanhamento do protocolo para ciência do
                representante legal e eventual regularização documental.
              </p>
            </div>
          </div>

          {/* 3. Rodapé */}
          <DialogFooter className="flex-col gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
              <Lock className="size-3.5 shrink-0 text-[#64748b]" aria-hidden="true" />
              <span>Parecer vinculado ao operador autenticado</span>
            </p>

            <div className="flex w-full flex-col-reverse items-center gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
                className="h-9 w-full rounded-lg border-[#cbd5e1] bg-[#ffffff] px-4 text-xs font-semibold text-[#334155] hover:bg-[#f1f5f9] hover:text-[#102c55] sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!isReasonValid || isSubmitting}
                className="h-9 w-full gap-1.5 rounded-lg bg-[#dc2626] px-5 text-xs font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Rejeitando...
                  </>
                ) : (
                  'Confirmar Rejeição'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
