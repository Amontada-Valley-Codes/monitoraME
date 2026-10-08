'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ArrowRight, BadgeCheck, BarChart3, Building2, FileDown, LockKeyhole, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { COMPLETE_REGISTRATION_PATH } from './config';
import { useLeadCta } from './lead-cta-context';
import { saveReturnTo } from './return-to';
import { useSession } from './session-context';

const FEATURES = {
  empenhos: { title: 'Entenda cada real empenhado', description: 'Acompanhe despesas, favorecidos, categorias e evolução dos gastos públicos com filtros avançados.', icon: BarChart3 },
  despesas: { title: 'Entenda cada real empenhado', description: 'Acompanhe despesas, favorecidos, categorias e evolução dos gastos públicos com filtros avançados.', icon: BarChart3 },
  fornecedores: { title: 'Conheça quem fornece ao poder público', description: 'Consulte fornecedores, participação nas compras, valores recebidos e histórico de empenhos.', icon: Building2 },
  territorio: { title: 'Transforme dados em visão territorial', description: 'Compare regiões, encontre concentrações e identifique oportunidades no território.', icon: Target },
  comparar: { title: 'Compare resultados lado a lado', description: 'Cruze municípios e períodos para encontrar diferenças, tendências e referências de desempenho.', icon: BarChart3 },
  comparacao: { title: 'Compare resultados lado a lado', description: 'Cruze municípios e períodos para encontrar diferenças, tendências e referências de desempenho.', icon: BarChart3 },
  metas: { title: 'Converta indicadores em metas', description: 'Organize objetivos de gestão e acompanhe a evolução dos resultados em um único lugar.', icon: Target },
  relatorios: { title: 'Leve a análise para onde precisar', description: 'Crie relatórios claros e exporte informações para apoiar decisões e apresentações.', icon: FileDown },
  qualidade: { title: 'Avalie a confiança dos dados', description: 'Acompanhe cobertura, atualização e consistência das bases usadas nas análises.', icon: BadgeCheck },
  metodologia: { title: 'Conheça a metodologia completa', description: 'Entenda as fontes, os recortes e os critérios usados para transformar dados públicos em indicadores.', icon: BadgeCheck },
  planos: { title: 'Conheça todas as possibilidades', description: 'Veja os recursos disponíveis para ampliar suas análises conforme a necessidade da sua organização.', icon: Sparkles },
} as const;

export function CompleteAccountGate({ children }: { children: ReactNode }) {
  const { status, accountStatus } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openLeadCta } = useLeadCta();

  if (status === 'loading') return <GateSkeleton />;
  if (status === 'authenticated' && accountStatus !== 'ONBOARDING') return children;

  const returnTo = `${pathname}${searchParams.size ? `?${searchParams}` : ''}`;
  const section = pathname.split('/').filter((part) => part in FEATURES).at(-1) ?? '';
  const feature = FEATURES[section as keyof typeof FEATURES] ?? {
    title: 'Desbloqueie a análise completa',
    description: 'Acesse filtros avançados, cruzamentos e informações detalhadas para tomar decisões com mais segurança.',
    icon: Sparkles,
  };
  const Icon = feature.icon;
  const completeHref = `${COMPLETE_REGISTRATION_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
  const rememberDestination = () => saveReturnTo(returnTo);

  return (
    <section className="relative mx-auto my-8 max-w-5xl overflow-hidden rounded-3xl border bg-card shadow-xl shadow-primary/5" aria-labelledby="account-gate-title">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-emerald-400" />
      <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
        <div className="p-7 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"><LockKeyhole className="size-3.5" />Conta gratuita</span>
          <div className="mt-7 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Icon className="size-7" /></div>
          <h1 id="account-gate-title" className="mt-6 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">{feature.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{feature.description}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {status === 'authenticated' ? (
              <Button asChild size="lg" className="min-w-52" onClick={rememberDestination}><Link href={completeHref}>Continuar cadastro <ArrowRight /></Link></Button>
            ) : (
              <Button size="lg" className="min-w-52" onClick={() => { rememberDestination(); openLeadCta(); }}>Criar conta gratuita <ArrowRight /></Button>
            )}
            <Button asChild size="lg" variant="outline"><Link href="/analitico">Voltar à visão geral</Link></Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Sem cobrança para criar sua conta. Recursos de assinatura serão identificados separadamente.</p>
        </div>
        <div className="border-t bg-gradient-to-br from-primary/10 via-secondary/60 to-background p-7 lg:border-l lg:border-t-0 lg:p-10">
          <p className="text-sm font-semibold">Ao concluir seu cadastro, você poderá:</p>
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            {['Aplicar filtros e recortes avançados', 'Consultar detalhes e históricos completos', 'Salvar seu contexto entre as análises'].map((benefit) => <li key={benefit} className="flex gap-3"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" /><span>{benefit}</span></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function GateSkeleton() {
  return <div className="mx-auto max-w-5xl space-y-4"><Skeleton className="h-12 w-40" /><Skeleton className="h-96 w-full rounded-3xl" /></div>;
}
