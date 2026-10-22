'use client';

import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPinned,
  ReceiptText,
  Building2,
  ArrowLeftRight,
  Search,
  ChevronRight,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { OverviewFilters } from '@/features/analytics/components/overview-filters';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Logo } from '@/shared/components/logo';
import { useAnalytics } from '@/features/analytics/data/context';
import { MUNICIPALITIES, SUPPLIERS } from '@/features/analytics/data/fixtures';
import { TCE_MUNICIPALITIES } from '@/features/analytics/pipeline/municipalities';
import { useProtectedNavigate } from '@/shared/auth/protected-navigation';
import { LoadingState } from '@/shared/components/states';

const normalizeMunicipality = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

export const NAV = [
  { path: '/analitico', label: 'Visão geral', icon: LayoutDashboard },
  { path: '/analitico/municipios', label: 'Municípios', icon: MapPinned },
  { path: '/analitico/empenhos', label: 'Empenhos', icon: ReceiptText },
  { path: '/analitico/fornecedores', label: 'Fornecedores', icon: Building2 },
  // { path: '/analitico/territorio', label: 'Análise territorial', icon: Globe },
  { path: '/analitico/comparar', label: 'Comparação', icon: ArrowLeftRight },
  // { path: '/analitico/metas', label: 'Metas de gestão', icon: Target },
  // { path: '/analitico/relatorios', label: 'Relatórios', icon: Files },
  // { path: '/analitico/qualidade', label: 'Qualidade da base', icon: Database },
  // { path: '/analitico/metodologia', label: 'Metodologia e fontes', icon: BookOpen },
];

const PLANS_PAGE = {
  path: '/analitico/planos',
  label: 'Planos',
};

function Navigation() {
  const path = usePathname();
  const { navigate, state: loadState } = useAnalytics();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const protectedNavigate = useProtectedNavigate();
  const isCommitmentDetail = path.startsWith('/analytics/empenhos/');
  const isSupplierDetail = path.startsWith('/analytics/fornecedores/');

  return (
    <Sidebar collapsible="icon" className="analytics-navigation">
      <SidebarHeader className="analytics-navigation-header h-(--header-height) justify-center px-3 group-data-[collapsible=icon]:px-2">
        <div className="flex w-full items-center gap-2">
          {(isMobile || state === 'expanded') && <Button
            variant="ghost"
            disabled={loadState === 'loading'}
            onClick={() => {
              navigate('/');
              setOpenMobile(false);
            }}
            className="min-w-0 flex-1 justify-start p-0 hover:bg-transparent group-data-[collapsible=icon]:justify-center"
            aria-label="MonitoraME início"
          >
            <Logo className="size-6 w-auto max-w-full text-brand-ink" />
          </Button>}
          {isMobile && <SidebarTrigger aria-label="Fechar navegação" title="Fechar navegação (Ctrl+B)" className="size-11 shrink-0" />}
          {!isMobile && <SidebarTrigger aria-label={state === 'expanded' ? 'Recolher navegação' : 'Expandir navegação'} title="Alternar navegação (Ctrl+B)" className="size-11 shrink-0 rounded-xl border border-sidebar-border" />}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="pt-5">
          <SidebarGroupLabel className="sr-only">
            Poder Público
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {NAV.slice(0, 6).map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  tooltip={item.label}
                  isActive={
                    item.path === '/analitico/empenhos' && isCommitmentDetail
                      ? true
                      : item.path === '/analitico/fornecedores' && isSupplierDetail
                      ? true
                      : item.path === '/analitico'
                      ? path === item.path
                      : path === item.path || path.startsWith(`${item.path}/`)
                  }
                  onClick={() => {
                    if (loadState === 'loading') return;
                    if (item.path === '/analitico/municipios') void protectedNavigate(item.path);
                    else navigate(item.path);
                    setOpenMobile(false);
                  }}
                  className="analytics-navigation-link relative min-h-12 gap-3 rounded-xl px-3 text-base transition-colors data-[active=true]:font-semibold"
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}

function ShellContent({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { navigate, state, filters } = useAnalytics();
  const protectedNavigate = useProtectedNavigate();
  const [search, setSearch] = useState(false);
  const { state: sidebarState, isMobile, openMobile } = useSidebar();
  const isOverview = path === '/analitico';

  const current = path.startsWith('/analytics/empenhos/')
    ? NAV.find((item) => item.path === '/analitico/empenhos')!
    : path.startsWith('/analytics/fornecedores/')
    ? NAV.find((item) => item.path === '/analitico/fornecedores')!
    : path.startsWith(PLANS_PAGE.path)
    ? PLANS_PAGE
    : NAV.find((n) => (n.path === '/' ? path === '/' : path.startsWith(n.path))) ?? NAV[0];

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (state === 'loading') return;
        setSearch((v) => !v);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [state]);

  const go = (path: string) => {
    if (state === 'loading') return;
    navigate(path);
    setSearch(false);
  };

  const openMunicipality = (name: string) => {
    if (state === 'loading') return;
    const code = TCE_MUNICIPALITIES.find((item) => normalizeMunicipality(item.name) === normalizeMunicipality(name))?.code;
    if (!code) return;
    const params = new URLSearchParams({ municipality_tce_code: code, start_date: filters.start, end_date: filters.end });
    void protectedNavigate(`/analitico/municipios?${params}`);
    setSearch(false);
  };

  return (
    <>
      <Navigation />
      <SidebarInset className="analytics-main-panel min-w-0 overflow-clip">
        <header className={`analytics-topbar ${isOverview ? 'analytics-topbar-overview' : ''} sticky top-0 z-20 flex min-h-(--header-height) flex-wrap items-center gap-3 px-4 py-3 sm:px-6`}>
          <SidebarTrigger
            aria-label={isMobile
              ? openMobile ? 'Fechar navegação' : 'Abrir navegação'
              : sidebarState === 'expanded' ? 'Recolher navegação' : 'Expandir navegação'}
            title={isMobile
              ? openMobile ? 'Fechar navegação (Ctrl+B)' : 'Abrir navegação (Ctrl+B)'
              : sidebarState === 'expanded' ? 'Recolher navegação (Ctrl+B)' : 'Expandir navegação (Ctrl+B)'}
            className="size-11 rounded-xl border border-border bg-muted text-foreground md:hidden"
          />
          <Separator orientation="vertical" className="h-5! md:hidden" />
          <div className="analytics-breadcrumb flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Análises públicas</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              <strong className="truncate text-foreground">{current.label}</strong>
            </div>
          </div>

          <div className="analytics-topbar-actions flex items-center gap-3">
            {path === '/analitico' && (
              <>
                <OverviewFilters />
                <Button variant="outline" size="sm" className="analytics-top-action min-h-11 px-3" aria-label="Compartilhar recorte" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Link com o recorte copiado.');
                  } catch {
                    toast.error('Não foi possível copiar o link.');
                  }
                }}>
                  <Share2 className="size-4" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar no MonitoraME"
              className="analytics-top-action size-11 border border-border bg-muted"
              disabled={state === 'loading'}
              onClick={() => setSearch(true)}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </header>

        <div id="main-content" tabIndex={-1} className="analytics-page-content page-content flex flex-col outline-none">
          {children}
          <footer className="analytics-footer mt-auto pt-10 text-sm text-muted-foreground">
            <div className="flex flex-col gap-4 border-t py-5 lg:flex-row lg:items-center lg:justify-between">
              <nav aria-label="Navegação do rodapé" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {[['Visão geral', '/analitico'], ['Empenhos', '/analitico/empenhos'], ['Fornecedores', '/analitico/fornecedores'], ['Metodologia', '/analitico/metodologia']].map(([label, href]) => <Button key={href} variant="link" disabled={state === 'loading'} className="min-h-11 p-0 text-sm font-normal text-muted-foreground hover:text-primary" onClick={() => navigate(href)}>{label}</Button>)}
              </nav>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="font-medium text-foreground">Fontes:</span>
                <a href="https://www.tce.ce.gov.br/" target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">TCE Ceará</a>
                <a href="https://pncp.gov.br/app/" target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">PNCP</a>
                <a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">Receita Federal</a>
                <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
                <a href="https://wa.me/5588999513204?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20melhor%20a%20MonitoraME." target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"><MessageCircle className="size-3.5" />Contato</a>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t py-4 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} MonitoraME</span>
              <span>Ceará, Brasil · Dados públicos de fontes oficiais</span>
            </div>
          </footer>
        </div>
      </SidebarInset>

      {state === 'loading' && <LoadingState label="Carregando módulo analítico" />}

      <CommandDialog
        open={search}
        onOpenChange={setSearch}
        title="Buscar no MonitoraME"
        description="Encontre telas, municípios e fornecedores da demonstração."
      >
        <CommandInput placeholder="Buscar tela, município ou fornecedor..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            {NAV.map((n) => (
              <CommandItem key={n.path} onSelect={() => go(n.path)}>
                <n.icon className="size-4" />
                {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Municípios">
            {MUNICIPALITIES.map((m) => (
              <CommandItem
                key={m.id}
                value={m.name + ' ' + m.id}
                onSelect={() => openMunicipality(m.name)}
              >
                <MapPinned className="size-4" />
                {m.name}
                <span className="text-xs text-muted-foreground ml-auto">CE</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Fornecedores">
            {SUPPLIERS.map((s) => (
              <CommandItem
                key={s.id}
                value={s.id + ' ' + s.name + ' ' + s.cnpj}
                onSelect={() => go('/analitico/fornecedores/' + s.id)}
              >
                <Building2 className="size-4" />
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <div className="analytics-stage"><SidebarProvider
        className="analytics-shell-scale analytics-window"
        style={
          {
            '--sidebar-width': 'var(--sidebar-size)',
            '--sidebar-width-icon': 'var(--rail-size)',
            '--sidebar-height': '100svh',
          } as CSSProperties
        }
      >
        <ShellContent>{children}</ShellContent>
      </SidebarProvider></div>
    </>
  );
}
