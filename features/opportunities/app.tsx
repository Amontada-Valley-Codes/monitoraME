'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/states';
import { OpportunityCard } from './components/opportunity-card';
import { OpportunitySearch } from './components/opportunity-search';
import { OpportunityRightPanel } from './components/opportunity-right-panel';
import { companyDemoFixture } from './demo-fixture';
import type { DemoScenario } from './notification-repository';

const PAGE_SIZE = 3;
export default function OpportunitiesApp() {
  const [page, setPage] = useState(1); const [scenario, setScenario] = useState<DemoScenario>('success');
  const opportunities = companyDemoFixture.opportunities; const total = Math.ceil(opportunities.length / PAGE_SIZE);
  const items = opportunities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <div className="flex min-h-[calc(100svh-var(--header-height))] w-full bg-background">
    <main className="min-w-0 flex-1 bg-card"><OpportunitySearch />
      <div className="flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3 sm:px-6"><div><p className="text-sm font-semibold">Oportunidades para Nordeste Conecta</p><p className="text-xs text-muted-foreground">Score acompanhado dos motivos de compatibilidade · dados demonstrativos</p></div><label className="text-xs text-muted-foreground">Cenário<NativeSelect className="mt-1 w-40" value={scenario} onChange={(event) => { setScenario(event.target.value as DemoScenario); setPage(1); }}><NativeSelectOption value="success">Com dados</NativeSelectOption><NativeSelectOption value="loading">Carregando</NativeSelectOption><NativeSelectOption value="empty">Vazio</NativeSelectOption><NativeSelectOption value="error">Erro</NativeSelectOption><NativeSelectOption value="blocked">Plano bloqueado</NativeSelectOption></NativeSelect></label></div>
      {scenario === 'loading' && <LoadingState label="Carregando oportunidades" />}
      {scenario === 'error' && <div className="p-6"><ErrorState onRetry={() => setScenario('success')} /></div>}
      {scenario === 'empty' && <div className="p-6"><EmptyState title="Nenhuma oportunidade compatível" description="O Radar continuará monitorando o perfil da empresa." /></div>}
      {scenario === 'blocked' && <div className="p-6"><Card className="items-center p-10 text-center"><LockKeyhole className="size-8 text-muted-foreground" /><h2 className="font-semibold">Radar bloqueado neste cenário</h2><p className="text-sm text-muted-foreground">Ative um plano compatível para consultar oportunidades.</p><Button asChild variant="outline"><Link href="/analitico/planos">Conhecer planos</Link></Button></Card></div>}
      {scenario === 'success' && <><div className="divide-y">{items.map((item) => <OpportunityCard key={item.id} opportunity={item} />)}</div><nav aria-label="Paginação de oportunidades" className="flex items-center justify-between border-t p-4 sm:px-6"><Button variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">Página {page} de {total}</span><Button variant="outline" disabled={page === total} onClick={() => setPage((value) => value + 1)}>Próxima</Button></nav></>}
    </main><OpportunityRightPanel /></div>;
}
