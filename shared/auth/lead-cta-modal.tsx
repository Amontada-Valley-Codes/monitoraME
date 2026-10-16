'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, BarChart3, Loader2, LockKeyhole, MailCheck, ShieldCheck } from 'lucide-react';
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
type ApiProblem = { error?: { details?: Array<{ field?: string; message?: string }> }; details?: Array<{ field?: string; message?: string }> };

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
      const response = await fetch('/api/auth/onboarding', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...data, phone: normalizeBrazilianPhone(data.phone) }) });
      const body = await response.json().catch(() => ({})) as ApiProblem;
      if (response.ok) { setSentEmail(data.email); setCountdown(60); return; }
      if (response.status === 409) { setExistingAccount(true); setServerError('Você já tem cadastro. Entre na sua conta.'); return; }
      if (response.status === 400) {
        const details = body.details ?? body.error?.details ?? [];
        details.forEach((detail) => { if (detail.field === 'name' || detail.field === 'email' || detail.field === 'phone') setError(detail.field, { message: detail.message ?? 'Valor inválido.' }); });
        setServerError(details.length ? null : 'Revise os dados informados.');
        return;
      }
      setServerError('Não foi possível enviar o link agora. Tente novamente.');
    } catch { setServerError('Não foi possível conectar ao serviço. Tente novamente.'); }
  }

  const openLogin = () => {
    const returnTo = peekReturnTo();
    router.push(`${LOGIN_PATH}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-3xl" onOpenAutoFocus={(event) => { if (sentEmail) event.preventDefault(); }}>
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-primary/40 via-primary to-emerald-400" />
        {sentEmail ? (
          <div className="grid min-h-105 md:grid-cols-[1.15fr_.85fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MailCheck className="size-7" aria-hidden="true" /></div>
              <DialogHeader className="mt-6 text-left"><DialogTitle className="text-2xl leading-tight tracking-tight sm:text-3xl">Seu acesso está a caminho</DialogTitle><DialogDescription className="mt-1 leading-6">Enviamos um link seguro para <strong className="font-semibold text-foreground">{sentEmail}</strong>. Abra o e-mail neste navegador para continuar.</DialogDescription></DialogHeader>
              <p className="mt-4 rounded-xl border bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">Confira também a caixa de spam. Ao solicitar outro envio, o link anterior será invalidado.</p>
              {serverError && <p role="alert" className="mt-4 text-sm text-destructive">{serverError}</p>}
              <DialogFooter className="mt-6 flex-row justify-start sm:justify-start"><Button type="button" disabled={countdown > 0 || isSubmitting} onClick={() => void handleSubmit(submit)()}>{isSubmitting && <Loader2 className="animate-spin" />}{countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar link'}</Button><Button variant="ghost" type="button" onClick={() => { setSentEmail(null); setServerError(null); }}>Corrigir e-mail</Button></DialogFooter>
            </div>
            <aside className="hidden border-l bg-gradient-to-br from-primary/10 via-secondary/60 to-background p-9 md:flex md:flex-col md:justify-center"><ShieldCheck className="size-8 text-primary" /><p className="mt-5 font-semibold">Acesso protegido</p><p className="mt-2 text-sm leading-6 text-muted-foreground">O link é pessoal, tem validade limitada e leva você de volta ao ponto em que parou.</p></aside>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1.18fr_.82fr]">
            <form className="p-6 sm:p-9" onSubmit={handleSubmit(submit)} noValidate>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"><LockKeyhole className="size-3.5" />Acesso gratuito</span>
              <div className="mt-5 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20"><BarChart3 className="size-5" /></div>
              <DialogHeader className="mt-4 text-left"><DialogTitle className="text-2xl leading-tight tracking-tight sm:text-3xl">Veja o panorama do seu município</DialogTitle><DialogDescription className="mt-1 leading-6">Informe seus dados para receber um acesso seguro aos indicadores de compras públicas.</DialogDescription></DialogHeader>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label htmlFor="lead-name" className="mb-1.5 block text-sm font-medium">Nome completo</label><Input id="lead-name" autoFocus autoComplete="name" placeholder="Como podemos chamar você?" aria-invalid={Boolean(errors.name)} {...register('name')} />{errors.name && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>}</div>
                <div><label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium">E-mail profissional</label><Input id="lead-email" type="email" autoComplete="email" placeholder="voce@empresa.com.br" aria-invalid={Boolean(errors.email)} {...register('email')} />{errors.email && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}</div>
                <div><label htmlFor="lead-phone" className="mb-1.5 block text-sm font-medium">Telefone</label><Input id="lead-phone" inputMode="tel" autoComplete="tel" placeholder="(85) 99999-9999" aria-invalid={Boolean(errors.phone)} {...register('phone')} onChange={(event) => setValue('phone', maskBrazilianPhone(event.target.value), { shouldValidate: false })} />{errors.phone && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.phone.message}</p>}</div>
              </div>
              {serverError && <div role="alert" className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{serverError}</div>}
              {existingAccount && <Button variant="link" className="mt-2 h-auto p-0" type="button" onClick={openLogin}>Entrar na minha conta <ArrowRight /></Button>}
              <DialogFooter className="mt-6 block"><Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />}Receber link de acesso <ArrowRight /></Button><p className="mt-3 text-center text-[11px] leading-4 text-muted-foreground">Sem cobrança. Seus dados serão usados apenas para viabilizar o acesso e a comunicação sobre a plataforma.</p></DialogFooter>
            </form>
            <aside className="border-t bg-gradient-to-br from-primary/10 via-secondary/60 to-background p-6 md:border-l md:border-t-0 md:p-8">
              <p className="text-sm font-semibold">Com seu acesso, você poderá:</p>
              <ul className="mt-5 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3 md:grid-cols-1">{['Aplicar filtros e recortes avançados', 'Consultar detalhes e históricos completos', 'Retomar a análise sem perder seu contexto'].map((benefit) => <li key={benefit} className="flex gap-3"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" /><span className="leading-5">{benefit}</span></li>)}</ul>
              <div className="mt-6 rounded-xl border border-primary/15 bg-card/60 p-4 text-xs leading-5 text-muted-foreground backdrop-blur"><ShieldCheck className="mb-2 size-5 text-primary" />Seu acesso é enviado por e-mail, sem necessidade de criar ou memorizar uma senha.</div>
              <p className="mt-6 text-xs text-muted-foreground">Já possui cadastro? <Link href={LOGIN_PATH} onClick={(event) => { event.preventDefault(); openLogin(); }} className="font-semibold text-primary hover:underline">Entrar na conta</Link></p>
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
