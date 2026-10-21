'use client';

import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Building2, ChartPie, Info, MapPin, RefreshCw, RotateCcw, Share2, TriangleAlert, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SelectField } from '@/shared/components/select-field';
import { ChartPanel } from '@/shared/components/chart-panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/states';
import { compactMoney, money, percent } from '@/shared/lib/format';
import { COMPLETE_REGISTRATION_PATH, PUBLIC_ENTRY_PATH } from '@/shared/auth/config';
import { saveReturnTo } from '@/shared/auth/return-to';
import { useSession } from '@/shared/auth/session-context';
import { MUNICIPALITIES } from '../data/fixtures';
import { BarsChart, DonutChart, expenseColor, expenseShortLabel, TrendChart } from '../components/charts';
import { OverviewMetricCard } from '../components/overview-sections';
import { PageHeader } from '../components/page-header';
import { TceMunicipalitySelect } from '../components/tce-municipality-select';
import { TCE_MUNICIPALITIES } from '../pipeline/municipalities';
import { getMunicipalOverview, MunicipalOverviewError, toMunicipalOverviewApiParams } from '../municipal-overview/api';
import type { MunicipalOverview, MunicipalOverviewInput } from '../municipal-overview/types';
import { municipalOverviewInputSchema } from '../municipal-overview/validation';

const sizeNames: Record<string, string> = { ME: 'Microempresa', MEI: 'Microempreendedor individual', OUTROS_PORTES: 'Outros portes', NAO_IDENTIFICADO: 'Não identificado' };
const sizeColors: Record<string, string> = { ME: 'var(--size-me)', MEI: 'var(--size-mei)', OUTROS_PORTES: 'var(--size-other)', NAO_IDENTIFICADO: 'var(--size-unknown)' };
const destinationNames: Record<string, string> = { NO_MUNICIPIO_COMPRADOR: 'No município comprador', EM_OUTRO_MUNICIPIO: 'Em outro município do Ceará', FORA_DO_CEARA: 'Fora do Ceará', ORIGEM_NAO_IDENTIFICADA: 'Origem não identificada' };
const destinationColors: Record<string, string> = { NO_MUNICIPIO_COMPRADOR: 'var(--origin-local)', EM_OUTRO_MUNICIPIO: 'var(--origin-state)', FORA_DO_CEARA: 'var(--origin-external)', ORIGEM_NAO_IDENTIFICADA: 'var(--origin-unknown)' };
const DEFAULT_MUNICIPAL_YEAR = '2025';
const REGISTRATION_NOTICE_DISMISSED_KEY = 'monitorame:municipality-registration-notice-dismissed';

function normalized(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(); }
function codeFromLegacyId(id?: string) {
  if (id && /^\d{3}$/.test(id)) return id;
  const legacy = id ? MUNICIPALITIES.find((item) => item.id === id) : undefined;
  return legacy ? TCE_MUNICIPALITIES.find((item) => normalized(item.name) === normalized(legacy.name))?.code ?? '' : '';
}
function civilDate(value: string) { const [year, month, day] = value.split('-'); return `${day}/${month}/${year}`; }
function monthLabel(value: string) { const [year, month] = value.split('-'); return `${month}/${year}`; }
function monthDate(value: string) { const [year, month] = value.split('-').map(Number); return new Date(year, month - 1, 15, 12); }
function monthsBetween(start: string, end: string) {
  let year = Number(start.slice(0, 4)); let month = Number(start.slice(5, 7));
  const last = Number(end.slice(0, 4)) * 12 + Number(end.slice(5, 7));
  const values: string[] = [];
  while (year * 12 + month <= last && values.length < 240) { values.push(`${year}-${String(month).padStart(2, '0')}`); if (++month === 13) { month = 1; year += 1; } }
  return values;
}

function MunicipalFilters({ input, initialCode }: { input: MunicipalOverviewInput | null; initialCode: string }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [municipality, setMunicipality] = useState(input?.municipality_tce_code ?? initialCode);
  const [start, setStart] = useState(input?.start_date ?? `${DEFAULT_MUNICIPAL_YEAR}-01-01`);
  const [end, setEnd] = useState(input?.end_date ?? `${DEFAULT_MUNICIPAL_YEAR}-12-31`);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const years = Array.from({ length: 5 }, (_, index) => String(currentYear - index));

  function navigate(nextCode: string, nextStart: string, nextEnd: string) {
    const candidate = { municipality_tce_code: nextCode, start_date: nextStart, end_date: nextEnd };
    if (!municipalOverviewInputSchema.safeParse(candidate).success) { setError('Selecione um município e informe datas válidas.'); return; }
    setError('');
    router.replace(`/analitico/municipios?${new URLSearchParams(candidate)}`, { scroll: false });
  }

  const selectedYear = start.slice(0, 4) === end.slice(0, 4) && start.endsWith('-01-01') && end.endsWith('-12-31') ? start.slice(0, 4) : '';
  const customPeriod = selectedYear === '';

  return <div className="no-print mb-6">
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex w-full flex-col gap-1.5 sm:w-72"><Label htmlFor="overview-municipality">Município comprador</Label><TceMunicipalitySelect value={municipality || undefined} onValueChange={(code) => { const next = code ?? ''; setMunicipality(next); if (next) navigate(next, start, end); else router.replace('/analitico/municipios', { scroll: false }); }} className="h-11 w-full rounded-lg border-input bg-card px-3 shadow-xs" /></div>
      <div className="flex w-full flex-col gap-1.5 sm:w-36"><Label>Exercício</Label><SelectField value={selectedYear} onChange={(year) => { if (!year) { setOpen(true); return; } const nextStart = `${year}-01-01`; const nextEnd = `${year}-12-31`; setStart(nextStart); setEnd(nextEnd); if (municipality) navigate(municipality, nextStart, nextEnd); }} options={[{ value: '', label: 'Personalizado' }, ...years.map((year) => ({ value: year, label: year }))]} label="Selecionar exercício" className="h-11 bg-card" /></div>
      {customPeriod && <Button type="button" variant="ghost" size="icon" aria-label="Redefinir período" onClick={() => { const nextStart = `${DEFAULT_MUNICIPAL_YEAR}-01-01`; const nextEnd = `${DEFAULT_MUNICIPAL_YEAR}-12-31`; setStart(nextStart); setEnd(nextEnd); if (municipality) navigate(municipality, nextStart, nextEnd); }}><RotateCcw className="size-4" /></Button>}
      <p className="ml-auto hidden text-xs text-muted-foreground xl:block">Período: {civilDate(start)} a {civilDate(end)}</p>
    </div>
    {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader><SheetTitle>Refinar análise municipal</SheetTitle><SheetDescription>Defina um período personalizado para a consulta deste município.</SheetDescription></SheetHeader>
        <div className="space-y-5 p-6">
          <div><Label htmlFor="municipal-start" className="mb-2">Data inicial</Label><Input id="municipal-start" type="date" value={start} onChange={(event) => setStart(event.target.value)} /></div>
          <div><Label htmlFor="municipal-end" className="mb-2">Data final</Label><Input id="municipal-end" type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></div>
          {start > end && <p role="alert" className="text-sm text-destructive">A data inicial está depois da final; a consulta poderá ser rejeitada.</p>}
        </div>
        <SheetFooter>
          <Button disabled={!municipality || !start || !end} onClick={() => { navigate(municipality, start, end); setOpen(false); }}>Aplicar filtros</Button>
          <Button variant="outline" onClick={() => { const nextStart = `${DEFAULT_MUNICIPAL_YEAR}-01-01`; const nextEnd = `${DEFAULT_MUNICIPAL_YEAR}-12-31`; setStart(nextStart); setEnd(nextEnd); }}>Redefinir</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>;
}

function OverviewPanels({ data, input }: { data: MunicipalOverview; input: MunicipalOverviewInput }) {
  const { accountStatus } = useSession();
  const [showRegistrationNotice, setShowRegistrationNotice] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem(REGISTRATION_NOTICE_DISMISSED_KEY) !== 'true') return;
    // The dismissal preference only exists in the browser session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowRegistrationNotice(false);
  }, []);
  const dismissRegistrationNotice = () => {
    sessionStorage.setItem(REGISTRATION_NOTICE_DISMISSED_KEY, 'true');
    setShowRegistrationNotice(false);
  };
  const kpis = data.kpis ?? {};
  const sizes = (data.participacao_por_porte_empresarial ?? []).map((item) => ({ key: item.porte ?? 'NAO_IDENTIFICADO', name: sizeNames[item.porte ?? ''] ?? item.porte ?? 'Não identificado', value: item.valor_centavos ?? 0, percentage: item.percentual, color: sizeColors[item.porte ?? ''] ?? 'var(--chart-4)' }));
  const destinations = (data.destino_recursos ?? []).map((item) => ({ key: item.destino ?? 'ORIGEM_NAO_IDENTIFICADA', name: destinationNames[item.destino ?? ''] ?? item.destino ?? 'Não identificado', value: item.valor_centavos ?? 0, percentage: item.percentual, color: destinationColors[item.destino ?? ''] ?? 'var(--chart-4)' }));
  const expenses = (data.elementos_despesa ?? []).map((item, index) => ({ key: item.codigo ?? item.nome ?? 'elemento', name: item.nome ?? item.codigo ?? 'Elemento', shortLabel: expenseShortLabel(item.codigo ?? '', item.nome ?? item.codigo ?? 'Elemento'), value: item.valor_liquido_centavos ?? 0, color: expenseColor(item.codigo ?? '', index) }));
  const evolutionByMonth = new Map((data.evolucao_compras_consideradas ?? []).map((item) => [item.periodo, item]));
  const missing = new Set(data.competencias_ausentes ?? []);
  const published = new Set(data.competencias_publicadas ?? []);
  const evolution = monthsBetween(input.start_date, input.end_date).map((period) => { const row = evolutionByMonth.get(period); const unavailable = missing.has(period); const known = Boolean(row) || published.has(period); return { date: monthDate(period), label: monthLabel(period), total: unavailable || !known ? null : row?.compras_consideradas_centavos ?? 0, mpe: unavailable || !known ? null : row?.microempresas_centavos ?? 0, unavailable }; });
  const totalSizes = sizes.reduce((sum, item) => sum + item.value, 0);
  const totalDestinations = destinations.reduce((sum, item) => sum + item.value, 0);
  const series = [{ key: 'total', label: 'Compras consideradas', color: 'var(--chart-1)' }, { key: 'mpe', label: 'Microempresas', color: 'var(--size-me)' }];

  return <div className="dashboard-overview">
    {accountStatus === 'ONBOARDING' && showRegistrationNotice && <Alert className="relative mb-6 pr-12"><Building2 /><AlertTitle>Seu acesso inicial está ativo</AlertTitle><AlertDescription><p>Conclua seu cadastro para acessar empenhos, fornecedores e comparações.</p><Button asChild size="sm" className="mt-2"><Link href={COMPLETE_REGISTRATION_PATH}>Concluir cadastro</Link></Button></AlertDescription><Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 size-8 text-muted-foreground hover:text-foreground" aria-label="Fechar aviso de conclusão de cadastro" onClick={dismissRegistrationNotice}><X className="size-4" /></Button></Alert>}
    {(data.competencias_ausentes?.length ?? 0) > 0 && <Alert className="mb-3"><Info /><AlertTitle>Dados incompletos neste recorte</AlertTitle><AlertDescription>Competências {data.competencias_ausentes!.join(', ')} não publicadas.</AlertDescription></Alert>}
    {(data.falhas_competencias?.length ?? 0) > 0 && <Alert variant="destructive" className="mb-6"><TriangleAlert /><AlertTitle>Falhas no processamento</AlertTitle><AlertDescription>Algumas competências não puderam ser processadas; os demais dados continuam disponíveis.</AlertDescription></Alert>}

    <div className="dashboard-metrics mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <OverviewMetricCard label="Participação de ME e MEI" value={percent(kpis.percentual_participacao_me ?? null)} detail="Percentual consolidado para o período" icon={ChartPie} />
      <OverviewMetricCard label="Total de compras de ME" value={kpis.total_compras_ME_centavos == null ? '—' : compactMoney(kpis.total_compras_ME_centavos)} detail="Valor líquido em reais" icon={Wallet} />
      <OverviewMetricCard label="Compras com fornecedores locais" value={percent(kpis.percentual_compras_fornecedores_locais ?? null)} detail="No município comprador" icon={MapPin} />
      <OverviewMetricCard label="Recursos fora do município" value={percent(kpis.percentual_recursos_fora_municipio ?? null)} detail="Percentual consolidado para o período" icon={ArrowUpRight} />
    </div>

    <div className="mb-3">
      <ChartPanel className="analytics-fixed-chart dashboard-primary-chart" title="Evolução das compras consideradas" description="Lacunas representam competências não publicadas; períodos publicados sem movimento aparecem como zero." legend={series.map((item) => ({ label: item.label, color: item.color }))} rows={evolution.map((item) => ({ label: item.label, values: item.unavailable ? ['Dados não publicados', 'Dados não publicados'] : [item.total == null ? '—' : money(item.total), item.mpe == null ? '—' : money(item.mpe)] }))} empty={!evolution.length}><TrendChart data={evolution} series={series} /></ChartPanel>
    </div>

    <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
      <ChartPanel title="Participação por porte empresarial" rows={sizes.map((item) => ({ label: item.name, values: [money(item.value)] }))} empty={!sizes.length}><DonutChart data={sizes} total={totalSizes} /></ChartPanel>
      <ChartPanel title="Destino dos recursos" description="Origem em relação ao município comprador" rows={destinations.map((item) => ({ label: item.name, values: [money(item.value)] }))} empty={!destinations.length}><DonutChart data={destinations} total={totalDestinations} /></ChartPanel>
    </div>

    <div className="mb-3">
      <ChartPanel className="analytics-fixed-chart" title="Elementos de despesas" description="Valores líquidos consolidados" legend={expenses.map((item) => ({ label: item.shortLabel, color: item.color }))} rows={expenses.map((item) => ({ label: item.name, values: [money(item.value)] }))} empty={!expenses.length}><div className="h-(--chart-height) min-h-(--chart-height) w-full"><BarsChart data={expenses.map((item) => ({ name: item.key.slice(-2), label: item.shortLabel, color: item.color, value: item.value }))} series={[{ key: 'value', label: 'Valor líquido', color: 'var(--chart-1)' }]} colorKey="color" /></div></ChartPanel>
    </div>
  </div>;
}

export default function MunicipalityDetail({ id }: { id?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clear } = useSession();
  const initialCode = searchParams.get('municipality_tce_code') ?? codeFromLegacyId(id);
  const candidate = { municipality_tce_code: initialCode, start_date: searchParams.get('start_date') ?? `${DEFAULT_MUNICIPAL_YEAR}-01-01`, end_date: searchParams.get('end_date') ?? `${DEFAULT_MUNICIPAL_YEAR}-12-31` };
  const parsed = municipalOverviewInputSchema.safeParse(candidate);
  const input = parsed.success ? parsed.data : null;
  const apiParams = input ? toMunicipalOverviewApiParams(input) : null;
  const query = useQuery({ queryKey: ['tce-overview-municipal', apiParams], queryFn: ({ signal }) => getMunicipalOverview(input!, { signal }), enabled: Boolean(input), staleTime: 5 * 60 * 1000, placeholderData: keepPreviousData });
  const error = query.error instanceof MunicipalOverviewError ? query.error : query.error ? new MunicipalOverviewError(503, 'Não foi possível carregar o panorama.') : null;
  const selected = TCE_MUNICIPALITIES.find((item) => item.code === initialCode);
  const updating = query.isFetching && !query.isPending;
  const visibleMunicipalityName = query.isPlaceholderData
    ? selected?.name
    : query.data?.municipio?.nome ?? selected?.name;

  useEffect(() => {
    if (error?.status !== 401) return;
    const returnTo = `${pathname}${searchParams.size ? `?${searchParams}` : ''}`;
    saveReturnTo(returnTo); queryClient.clear(); void clear().then(() => router.replace(`${PUBLIC_ENTRY_PATH}?cta=lead&returnTo=${encodeURIComponent(returnTo)}`));
  }, [clear, error?.status, pathname, queryClient, router, searchParams]);

  return <>
    <Button variant="ghost" className="mb-3 h-auto self-start bg-transparent px-0 py-1 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground" onClick={() => router.push('/analitico')}><ArrowLeft />Voltar à visão geral</Button>
    <PageHeader eyebrow="Inteligência territorial" title={visibleMunicipalityName ?? 'Detalhes municipais'} description={input ? `${query.isPlaceholderData ? 'CE' : query.data?.municipio?.uf ?? 'CE'} · ${civilDate(input.start_date)} a ${civilDate(input.end_date)}` : 'Selecione um município para consultar os indicadores de compras públicas.'} actions={<Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success('Link com o recorte copiado.'); } catch { toast.error('Não foi possível copiar o link.'); } }}><Share2 /><span className="hidden sm:inline">Compartilhar</span></Button>} />
    <MunicipalFilters key={`${candidate.municipality_tce_code}:${candidate.start_date}:${candidate.end_date}`} input={input} initialCode={initialCode} />
    <div aria-busy={query.isFetching} aria-live="polite">{!initialCode ? <EmptyState title="Selecione um município" description="Escolha um município e um período para visualizar o panorama detalhado." /> : !parsed.success ? <Alert variant="destructive"><TriangleAlert /><AlertTitle>Parâmetros inválidos</AlertTitle><AlertDescription>Revise o município e o período informados.</AlertDescription></Alert> : query.isPending || updating ? <LoadingState /> : error && error.status !== 401 ? <div className="space-y-3"><ErrorState onRetry={() => void query.refetch()} /><Alert variant={error.status === 403 ? 'destructive' : 'default'}><TriangleAlert /><AlertTitle>{error.status === 403 ? 'Sua conta não tem autorização para acessar este recurso.' : error.status === 422 ? 'Consulta rejeitada. Revise o período e o município.' : error.status === 503 ? 'O serviço analítico está temporariamente indisponível.' : error.status === 400 ? 'Os parâmetros da consulta são inválidos.' : 'Não foi possível carregar o panorama.'}</AlertTitle>{error.requestId && <AlertDescription>Código de suporte: {error.requestId}</AlertDescription>}<Button size="sm" className="mt-2" onClick={() => void query.refetch()}><RefreshCw />Tentar novamente</Button></Alert></div> : query.data && input ? <OverviewPanels data={query.data} input={input} /> : null}</div>
  </>;
}
