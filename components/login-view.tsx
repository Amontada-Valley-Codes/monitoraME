import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

import { LoginForm } from '@/features/auth/components/login-form';
import type { LoginFormData } from '@/features/auth/schemas/login.schema';
import { Logo } from '@/shared/components/logo';

interface LoginViewProps {
  onSubmitAction: (data: LoginFormData) => Promise<void>;
}

export function LoginView({ onSubmitAction }: LoginViewProps) {
  return (
    <main className="relative grid h-svh place-items-center overflow-hidden bg-landing-paper px-4 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -right-36 -top-52 size-136 rotate-45 bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-72 -left-64 size-136 rotate-45 border-[5rem] border-primary/5" />

      <section className="login-page-scale relative mx-auto grid w-full max-w-6xl overflow-hidden border border-border/70 bg-card shadow-[0_32px_90px_-48px_rgb(0_20_41/40%)] lg:min-h-180 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative hidden overflow-hidden bg-landing-blue p-10 text-white lg:flex lg:flex-col xl:p-12">
          <div className="absolute -right-28 -top-32 size-80 rounded-full border-[3rem] border-white/5" />
          <div className="absolute -bottom-36 -left-28 size-80 rounded-full border-[3rem] border-white/5" />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_15%,color-mix(in_srgb,var(--landing-ink)_24%,transparent)_100%)]" />

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" aria-label="MonitoraME — página inicial" className="text-white">
              <Logo className="h-6 w-auto" />
            </Link>
            <span className="flex items-center gap-2 border border-white/15 bg-white/8 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/75 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#a9c5ff]" /> Dados públicos
            </span>
          </div>

          <div className="relative z-10 my-auto py-10">
            <div className="mb-7 max-w-md">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Inteligência territorial</p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-white xl:text-[2.8rem]">
                Suas decisões começam com uma visão mais clara.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/68">
                Acesse indicadores de compras públicas, fornecedores e participação das microempresas em um só lugar.
              </p>
            </div>

            <div className="relative mt-10">
              <div className="relative aspect-16/10 overflow-hidden border border-white/20 bg-landing-ink shadow-[0_28px_60px_-28px_rgb(0_20_41/65%)]">
                <Image
                  src="/auth/login-team.png"
                  alt="Profissionais colaborando com informações públicas em um tablet"
                  fill
                  sizes="(max-width: 1024px) 0px, 48vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--landing-ink)_34%,transparent),transparent_55%)]" />
              </div>

              {/* <div className="absolute -right-3 -top-5 flex items-center gap-3 bg-landing-ink px-4 py-3 text-white shadow-xl xl:-right-6">
                <span className="flex size-8 items-center justify-center bg-white/10"><BarChart3 className="size-4" /></span>
                <span><strong className="block font-mono text-sm">184</strong><small className="block text-[9px] uppercase tracking-wide text-white/55">municípios</small></span>
              </div> */}

              {/* <div className="absolute -bottom-5 left-5 flex items-center gap-2 bg-white px-4 py-3 text-xs font-semibold text-landing-ink shadow-xl">
                <CheckCircle2 className="size-4 text-primary" /> Bases integradas e auditadas
              </div> */}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-[10px] text-white/58">
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#a9c5ff]" />Ambiente protegido</span>
            <Link href="/analitico" className="flex items-center gap-1.5 font-semibold text-white transition-opacity hover:opacity-75">Ver dados públicos <ArrowUpRight className="size-3.5" /></Link>
          </div>
        </div>

        <div className="flex min-h-[calc(100svh-2.5rem)] flex-col bg-card p-6 sm:p-10 lg:min-h-0 lg:p-12 xl:p-16">
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="MonitoraME — página inicial" className="text-brand-ink"><Logo className="h-6 w-auto" /></Link>
            <Link href="/analitico" className="text-xs font-semibold text-primary">Dados públicos</Link>
          </div>

          <div className="my-auto py-10 lg:py-0">
            <LoginForm onSubmitAction={onSubmitAction} />
          </div>

          <p className="text-center text-[10px] leading-5 text-muted-foreground lg:text-left">
            Ao entrar, você confirma que leu os termos de uso e a política de privacidade do MonitoraME.
          </p>
        </div>
      </section>
    </main>
  );
}
