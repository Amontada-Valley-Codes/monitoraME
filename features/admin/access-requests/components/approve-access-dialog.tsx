'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  approveAccessRequest,
  getAccessRequestErrorMessage,
} from '../access-requests.service';

export interface ApproveAccessDialogProps {
  requestId: string;
  companyName: string;
  cnpj?: string;
  protocol?: string;
  locationLabel?: string;
  disabled?: boolean;
  onSuccess?: (requestId: string) => void;
}

const LIGHT_SURFACE_VARS = {
  '--background': '#f8fafc',
  '--card': '#ffffff',
  '--card-foreground': '#102c55',
  '--foreground': '#102c55',
  '--muted': '#f1f5f9',
  '--muted-foreground': '#64748b',
  '--border': '#e2e8f0',
  '--primary': '#1560bd',
  '--primary-foreground': '#ffffff',
  colorScheme: 'light',
} as React.CSSProperties;

export function ApproveAccessDialog({
  requestId,
  companyName,
  cnpj,
  protocol,
  locationLabel,
  disabled = false,
  onSuccess,
}: ApproveAccessDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleApprove(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await approveAccessRequest(requestId);
      toast.success('Solicitação aprovada com sucesso', {
        description: `O acesso de ${companyName} foi liberado na plataforma.`,
      });
      setOpen(false);
      onSuccess?.(requestId);
      router.refresh();
    } catch (error) {
      const message = getAccessRequestErrorMessage(
        error,
        `Não foi possível aprovar a solicitação de ${companyName}.`,
      );
      toast.error('Falha ao aprovar solicitação', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isSubmitting && setOpen(nextOpen)}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          disabled={disabled || isSubmitting}
          className="h-9 gap-1.5 rounded-lg bg-[#1560bd] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#102c55] disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
          )}
          Aprovar
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        style={LIGHT_SURFACE_VARS}
        className="max-w-lg gap-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#ffffff] p-0 text-[#102c55] shadow-[0_24px_60px_-15px_rgb(16_44_85/22%)]"
      >
        {/* 1. Cabeçalho */}
        <AlertDialogHeader className="border-b border-[#e2e8f0] bg-[#f8fafc] p-6 text-left">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#1560bd]/20 bg-[#eff6ff] text-[#1560bd]">
              <FileCheck2 className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] text-[#1560bd] uppercase">
                Governança & Credenciamento • Aprovação
              </span>
              <AlertDialogTitle className="text-base font-bold text-[#102c55]">
                Aprovar {companyName}? O acesso será liberado.
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs leading-relaxed text-[#64748b]">
                Confirme a validação documental para liberar as credenciais empresariais de{' '}
                <strong className="font-semibold text-[#102c55]">{companyName}</strong>.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

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

              <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-0.5 text-xs font-semibold text-[#15803d]">
                <span className="size-1.5 rounded-full bg-[#16a34a]" aria-hidden="true" />
                Apto para Aprovação
              </span>
            </div>
          </div>

          <div className="rounded-r-xl border border-[#dbeafe] border-l-4 border-l-[#1560bd] bg-[#f8fbff] p-4">
            <h4 className="mb-1 flex items-center gap-2 text-xs font-bold text-[#102c55]">
              <Scale className="size-4 shrink-0 text-[#1560bd]" aria-hidden="true" />
              Habilitação de Fornecedor MPE (LC 123/2006)
            </h4>
            <p className="text-xs leading-relaxed text-[#475569]">
              Ao confirmar, o acesso aos módulos contratados será liberado imediatamente e o
              protocolo{' '}
              <span className="data-value font-mono font-semibold text-[#102c55]">
                {protocol || requestId}
              </span>{' '}
              passará ao estado <strong className="text-[#15803d]">Aprovado</strong>.
            </p>
          </div>
        </div>

        {/* 3. Rodapé */}
        <AlertDialogFooter className="flex-col gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
            <ShieldCheck className="size-3.5 shrink-0 text-[#1560bd]" aria-hidden="true" />
            <span>Ação auditada no registo do MonitoraME</span>
          </p>

          <div className="flex w-full flex-col-reverse items-center gap-2 sm:w-auto sm:flex-row">
            <AlertDialogCancel
              disabled={isSubmitting}
              className="h-9 w-full rounded-lg border-[#cbd5e1] bg-[#ffffff] px-4 text-xs font-semibold text-[#334155] hover:bg-[#f1f5f9] hover:text-[#102c55] sm:w-auto"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isSubmitting}
              className="h-9 w-full gap-1.5 rounded-lg bg-[#1560bd] px-5 text-xs font-semibold text-white hover:bg-[#102c55] sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Aprovando...
                </>
              ) : (
                'Aprovar'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
