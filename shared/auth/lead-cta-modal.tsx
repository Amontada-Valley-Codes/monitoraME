'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LOGIN_PATH } from './config';
import { isValidBrazilianPhone, maskBrazilianPhone, normalizeBrazilianPhone } from './phone';
import { peekReturnTo } from './return-to';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  phone: z.string().refine(isValidBrazilianPhone, 'Informe DDD e telefone com 10 ou 11 dígitos.'),
});
type LeadForm = z.infer<typeof leadSchema>;
type ApiProblem = { error?: { message?: string; details?: Array<{ field?: string; message?: string }> }; message?: string; details?: Array<{ field?: string; message?: string }> };

export function LeadCtaModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState(false);
  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<LeadForm>({ resolver: zodResolver(leadSchema), defaultValues: { name: '', email: '', phone: '' } });

  useEffect(() => {
    if (!countdown) return;
    const id = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [countdown]);

  async function submit(data: LeadForm) {
    setServerError(null);
    setExistingAccount(false);
    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, phone: normalizeBrazilianPhone(data.phone) }),
      });
      const body = await response.json().catch(() => ({})) as ApiProblem;
      if (response.ok) {
        setSentEmail(data.email);
        setCountdown(60);
        return;
      }
      if (response.status === 409) {
        setExistingAccount(true);
        setServerError('Você já tem cadastro. Entre na sua conta.');
        return;
      }
      if (response.status === 400) {
        const details = body.details ?? body.error?.details ?? [];
        details.forEach((detail) => {
          if (detail.field === 'name' || detail.field === 'email' || detail.field === 'phone') setError(detail.field, { message: detail.message ?? 'Valor inválido.' });
        });
        setServerError(details.length ? null : 'Revise os dados informados.');
        return;
      }
      setServerError('Não foi possível enviar o link agora. Tente novamente.');
    } catch {
      setServerError('Não foi possível conectar ao serviço. Tente novamente.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(event) => { if (sentEmail) event.preventDefault(); }}>
        {sentEmail ? (
          <>
            <DialogHeader>
              <MailCheck className="mb-2 size-9 text-primary" aria-hidden="true" />
              <DialogTitle>Enviamos seu link de acesso</DialogTitle>
              <DialogDescription>Enviamos um link para {sentEmail}. Abra o e-mail neste mesmo navegador para continuar.</DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Confira também a caixa de spam. Ao pedir outro link, o anterior será invalidado.</p>
            {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
            <DialogFooter className="sm:justify-between">
              <Button variant="ghost" type="button" onClick={() => { setSentEmail(null); setServerError(null); }}>Corrigir e-mail</Button>
              <Button type="button" disabled={countdown > 0 || isSubmitting} onClick={() => void handleSubmit(submit)()}>
                {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar link'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(submit)} noValidate>
            <DialogHeader>
              <DialogTitle>Veja o panorama do seu município</DialogTitle>
              <DialogDescription>Receba por e-mail um acesso seguro aos indicadores de compras públicas.</DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-4">
              <div><label htmlFor="lead-name" className="mb-1 block text-sm font-medium">Nome</label><Input id="lead-name" autoFocus autoComplete="name" {...register('name')} />{errors.name && <p role="alert" className="mt-1 text-xs text-destructive">{errors.name.message}</p>}</div>
              <div><label htmlFor="lead-email" className="mb-1 block text-sm font-medium">E-mail</label><Input id="lead-email" type="email" autoComplete="email" {...register('email')} />{errors.email && <p role="alert" className="mt-1 text-xs text-destructive">{errors.email.message}</p>}</div>
              <div><label htmlFor="lead-phone" className="mb-1 block text-sm font-medium">Telefone</label><Input id="lead-phone" inputMode="tel" autoComplete="tel" placeholder="(85) 99999-9999" {...register('phone')} onChange={(event) => setValue('phone', maskBrazilianPhone(event.target.value), { shouldValidate: false })} />{errors.phone && <p role="alert" className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}</div>
              {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
              {existingAccount && <Button asChild variant="link" className="h-auto p-0"><Link href={LOGIN_PATH} onClick={(event) => { event.preventDefault(); const returnTo = peekReturnTo(); router.push(`${LOGIN_PATH}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`); }}>Entrar</Link></Button>}
            </div>
            <DialogFooter><Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />}Receber link de acesso</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

