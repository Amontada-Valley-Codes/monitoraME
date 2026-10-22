import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { Logo } from "@/shared/components/logo";

interface AuthPageShellProps {
  children: React.ReactNode;
  completion?: boolean;
}

export function AuthPageShell({ children, completion = false }: AuthPageShellProps) {
  return (
    <main className={`relative min-h-svh bg-landing-paper px-4 py-5 sm:px-6 lg:grid lg:place-items-center lg:px-10 ${completion ? "overflow-x-hidden lg:h-svh lg:min-h-0 lg:overflow-hidden lg:py-0" : "overflow-hidden lg:py-8"}`}>
      <div className="pointer-events-none absolute -right-36 -top-52 size-136 rotate-45 bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-72 -left-64 size-136 rotate-45 border-[5rem] border-primary/5" />

      <section className={`login-page-scale relative mx-auto grid w-full max-w-6xl overflow-hidden border border-border/70 bg-card shadow-[0_32px_90px_-48px_rgb(0_20_41/40%)] lg:grid-cols-[1.02fr_0.98fr] ${completion ? "lg:h-[111.111svh] lg:min-h-0" : "lg:min-h-180"}`}>
        <div className="relative hidden overflow-hidden bg-landing-blue p-10 text-white lg:flex lg:flex-col xl:p-12">
          <div className="absolute -right-28 -top-32 size-80 rounded-full border-[3rem] border-white/5" />
          <div className="absolute -bottom-36 -left-28 size-80 rounded-full border-[3rem] border-white/5" />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_15%,color-mix(in_srgb,var(--landing-ink)_24%,transparent)_100%)]" />

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" aria-label="MonitoraME — página inicial" className="text-white">
              <Logo className="h-6 w-auto" />
            </Link>
            <span className="flex items-center gap-2 border border-white/15 bg-white/8 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/75 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#a9c5ff]" /> {completion ? "Etapa final" : "Cadastro seguro"}
            </span>
          </div>

          <div className="relative z-10 my-auto py-8">
            <div className="mb-7 max-w-md">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                {completion ? "Seu acesso está quase pronto" : "Inteligência territorial"}
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-white xl:text-[2.8rem]">
                {completion ? "Complete seu cadastro e comece a explorar." : "Transforme dados públicos em decisões melhores."}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/68">
                {completion
                  ? "Confirme seus dados, crie uma senha segura e acesse todas as análises disponíveis para você."
                  : "Crie sua conta para acompanhar oportunidades, fornecedores e compras públicas em um só lugar."}
              </p>
            </div>

            <div className="relative mt-8">
              <div className="relative aspect-video overflow-hidden border border-white/20 bg-landing-ink shadow-[0_28px_60px_-28px_rgb(0_20_41/65%)]">
                <Image
                  src="/auth/login-team.png"
                  alt="Profissionais colaborando com informações públicas em um tablet"
                  fill
                  sizes="(max-width: 1024px) 0px, 48vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--landing-ink)_38%,transparent),transparent_62%)]" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 border border-white/15 bg-landing-ink/80 px-3 py-2 text-[10px] font-semibold backdrop-blur-sm">
                  <CheckCircle2 className="size-3.5 text-[#a9c5ff]" /> Dados integrados em um único ambiente
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-[10px] text-white/58">
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#a9c5ff]" />Ambiente protegido</span>
            <Link href="/analitico" className="flex items-center gap-1.5 font-semibold text-white transition-opacity hover:opacity-75">
              Ver dados públicos <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="flex min-h-[calc(100svh-2.5rem)] flex-col bg-card p-6 sm:p-10 lg:min-h-0 lg:p-12 xl:p-14">
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="MonitoraME — página inicial" className="text-brand-ink"><Logo className="h-6 w-auto" /></Link>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary">{completion ? "Etapa final" : "Cadastro seguro"}</span>
          </div>
          <div className="my-auto py-9 lg:py-4">{children}</div>
          <p className="text-center text-[10px] leading-5 text-muted-foreground lg:text-left">
            Seus dados são usados somente para fornecer e proteger o seu acesso ao MonitoraME.
          </p>
        </div>
      </section>
    </main>
  );
}
