'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SUSPENSION_REASON_MIN, formatCnpj } from '../rules';
import type { AdminCompany, CompanyAccessChange } from '../types';

export type AccessRequest = { company: AdminCompany; kind: CompanyAccessChange['kind'] };

/** Confirmação obrigatória para operações sensíveis de acesso. */
export function CompanyAccessDialog({
  request,
  pending,
  onCancel,
  onConfirm,
}: {
  request: AccessRequest | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: (change: CompanyAccessChange) => void;
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const suspend = request?.kind === 'suspend';
  const reasonValid = reason.trim().length >= SUSPENSION_REASON_MIN;

  const close = () => {
    if (pending) return;
    setReason('');
    setTouched(false);
    onCancel();
  };
  const confirm = () => {
    setTouched(true);
    if (suspend && !reasonValid) return;
    onConfirm(suspend ? { kind: 'suspend', reason: reason.trim() } : { kind: 'reactivate' });
  };

  return (
    <AlertDialog open={request !== null} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{suspend ? 'Suspender acesso da empresa?' : 'Reativar acesso da empresa?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {request && (
              <>
                <b className="font-semibold text-foreground">{request.company.legal_name}</b> · CNPJ {formatCnpj(request.company.cnpj)}.{' '}
                {suspend
                  ? 'A equipe da empresa perde o acesso aos recursos privados até a reativação. Os dados cadastrados são preservados.'
                  : 'A equipe da empresa volta a acessar os recursos do plano contratado.'}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {suspend && (
          <div className="space-y-2">
            <label htmlFor="suspension-reason" className="text-sm font-medium">Motivo da suspensão</label>
            <Textarea
              id="suspension-reason"
              value={reason}
              maxLength={500}
              disabled={pending}
              aria-invalid={touched && !reasonValid}
              aria-describedby="suspension-reason-hint"
              placeholder="Ex.: documentação com indício de irregularidade."
              onChange={(event) => setReason(event.target.value)}
            />
            <p id="suspension-reason-hint" className={cn('text-xs', touched && !reasonValid ? 'text-destructive' : 'text-muted-foreground')}>
              Obrigatório, mínimo de {SUSPENSION_REASON_MIN} caracteres. Fica registrado no histórico da empresa.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <Button variant={suspend ? 'destructive' : 'default'} disabled={pending} onClick={confirm}>
            {pending && <Loader2 className="animate-spin" />}
            {suspend ? (pending ? 'Suspendendo...' : 'Suspender') : pending ? 'Reativando...' : 'Reativar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
