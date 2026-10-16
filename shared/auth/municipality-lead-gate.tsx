'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, BadgeCheck, BarChart3, Loader2, LockKeyhole, MailCheck } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TCE_MUNICIPALITIES } from '@/features/analytics/pipeline/municipalities';
import { LOGIN_PATH } from './config';
import { isValidBrazilianPhone, maskBrazilianPhone, normalizeBrazilianPhone } from './phone';
import { peekReturnTo } from './return-to';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  phone: z.string().refine(isValidBrazilianPhone, 'Informe DDD e telefone com 10 ou 11 dígitos.'),
});

type LeadForm = z.infer<typeof leadSchema>;
type ApiProblem = {
  error?: { details?: Array<{ field?: string; message?: string }> };
  details?: Array<{ field?: string; message?: string }>;
};

export function MunicipalityLeadGate() {
  const searchParams = useSearchParams();
  const municipalityCode = searchParams.get('municipality_tce_code');
  const municipality = TCE_MUNICIPALITIES.find((item) => item.code === municipalityCode);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState(false);
  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

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
        setServerError('Você já tem cadastro. Entre para continuar sua consulta.');
        return;
      }
      if (response.status === 400) {
        const details = body.details ?? body.error?.details ?? [];
        details.forEach((detail) => {
          if (detail.field === 'name' || detail.field === 'email' || detail.field === 'phone') {
            setError(detail.field, { message: detail.message ?? 'Valor inválido.' });
          }
        });
        setServerError(details.length ? null : 'Revise os dados informados.');
        return;
      }
      setServerError('Não foi possível enviar o link agora. Tente novamente.');
    } catch {
      setServerError('Não foi possível conectar ao serviço. Tente novamente.');
    }
  }

  const loginHref = `${LOGIN_PATH}?returnTo=${encodeURIComponent(peekReturnTo() ?? '/analitico/municipios')}`;

  return (
    <section className="relative mx-auto my-6 w-full max-w-5xl overflow-hidden rounded-3xl border bg-card shadow-xl shadow-primary/5" aria-labelledby="municipality-lead-title">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary/40 via-primary to-emerald-400" />
      <div className="grid min-h-145 lg:grid-cols-[1.16fr_.84fr]">
        <div className="flex flex-col bg-card p-6 sm:p-9 lg:p-11">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            <LockKeyhole className="size-3.5" /> Acesso gratuito
          </span>

          {sentEmail ? (
            <div className="my-auto max-w-lg py-10">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MailCheck className="size-7" /></div>
              <h1 id="municipality-lead-title" className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Seu acesso está a caminho</h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Enviamos um link seguro para <strong className="text-foreground">{sentEmail}</strong>. Abra o e-mail neste navegador para continuar a análise{municipality ? ` de ${municipality.name}` : ''}.</p>
              <p className="mt-3 text-xs text-muted-foreground">Confira também a caixa de spam. Um novo envio invalida o link anterior.</p>
              {serverError && <p role="alert" className="mt-4 text-sm text-destructive">{serverError}</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button type="button" disabled={countdown > 0 || isSubmitting} onClick={() => void handleSubmit(submit)()}>
                  {isSubmitting && <Loader2 className="animate-spin" />}{countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar link'}
                </Button>
                <Button variant="outline" type="button" onClick={() => { setSentEmail(null); setServerError(null); }}>Corrigir e-mail</Button>
              </div>
            </div>
          ) : (
            <form className="mt-7" onSubmit={handleSubmit(submit)} noValidate>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><BarChart3 className="size-6" /></div>
              <h1 id="municipality-lead-title" className="mt-5 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Veja o panorama completo do seu município</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Preencha seus dados para receber um link seguro e acessar os indicadores{municipality ? ` de ${municipality.name}` : ' municipais'}.</p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2" id="municipality-lead-name" label="Nome completo" error={errors.name?.message}>
                  <Input id="municipality-lead-name" autoFocus autoComplete="name" placeholder="Como podemos chamar você?" {...register('name')} />
                </Field>
                <Field id="municipality-lead-email" label="E-mail profissional" error={errors.email?.message}>
                  <Input id="municipality-lead-email" type="email" autoComplete="email" placeholder="voce@empresa.com.br" {...register('email')} />
                </Field>
                <Field id="municipality-lead-phone" label="Telefone" error={errors.phone?.message}>
                  <Input id="municipality-lead-phone" inputMode="tel" autoComplete="tel" placeholder="(85) 99999-9999" {...register('phone')} onChange={(event) => setValue('phone', maskBrazilianPhone(event.target.value), { shouldValidate: false })} />
                </Field>
              </div>

              {serverError && <p role="alert" className="mt-4 text-sm text-destructive">{serverError}</p>}
              {existingAccount && <Button asChild variant="link" className="mt-1 h-auto p-0"><Link href={loginHref}>Entrar na minha conta</Link></Button>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button type="submit" size="lg" className="min-w-52" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" />}Receber link de acesso <ArrowRight />
                </Button>
                <Button asChild size="lg" variant="outline"><Link href="/analitico">Voltar à visão geral</Link></Button>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">Sem cobrança para criar sua conta. Seus dados serão usados somente para viabilizar seu acesso e comunicação sobre a plataforma.</p>
            </form>
          )}
        </div>

        <aside className="border-t bg-linear-to-br from-primary/10 via-secondary/60 to-background p-7 lg:border-l lg:border-t-0 lg:p-10">
          <p className="text-sm font-semibold">Com seu acesso, você poderá:</p>
          <ul className="mt-6 space-y-5 text-sm text-muted-foreground">
            {[
              'Aplicar filtros por município e exercício',
              'Consultar despesas e fornecedores em detalhes',
              'Comparar a participação das micro e pequenas empresas',
              'Retomar sua análise sem perder o recorte selecionado',
            ].map((benefit) => <li key={benefit} className="flex gap-3"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" /><span className="leading-6">{benefit}</span></li>)}
          </ul>
          {municipality && <div className="mt-9 rounded-2xl border border-primary/15 bg-card/65 p-5 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Consulta selecionada</p><p className="mt-2 text-lg font-semibold">{municipality.name}</p><p className="mt-1 text-xs text-muted-foreground">Seu recorte ficará disponível após confirmar o acesso.</p></div>}
          <p className="mt-8 text-xs leading-5 text-muted-foreground">Já possui cadastro? <Link href={loginHref} className="font-semibold text-primary hover:underline">Entrar na conta</Link></p>
        </aside>
      </div>
    </section>
  );
}

function Field({ id, label, error, className = '', children }: { id: string; label: string; error?: string; className?: string; children: ReactNode }) {
  return <div className={className}><label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>{children}{error && <p role="alert" className="mt-1.5 text-xs text-destructive">{error}</p>}</div>;
}
