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
import { Logo, LogoIcon } from '@/shared/components/logo';
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-(--header-height) justify-center border-b border-sidebar-border bg-sidebar/80 px-3 group-data-[collapsible=icon]:px-2">
        <div className="flex w-full items-center gap-2">
          <Button
            variant="ghost"
            disabled={loadState === 'loading'}
            onClick={() => {
              navigate('/');
              setOpenMobile(false);
            }}
            className="min-w-0 flex-1 justify-start p-0 hover:bg-transparent group-data-[collapsible=icon]:justify-center"
            aria-label="MonitoraME início"
          >
            {isMobile || state === 'expanded'
              ? <Logo className="size-6 w-auto max-w-full text-brand-ink" />
              : <LogoIcon className="size-6 shrink-0 text-brand-ink" />}
          </Button>
          {isMobile && <SidebarTrigger aria-label="Fechar navegação" title="Fechar navegação (Ctrl+B)" className="size-9 shrink-0" />}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="pt-5">
          <SidebarGroupLabel className="sr-only">
            Análises públicas
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
                  className="relative min-h-10 gap-2.5 rounded-md px-2.5 text-xs transition-colors data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
                >
                  <item.icon className="size-4" />
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
      <SidebarInset className="min-w-0 overflow-clip border-l border-border/70 bg-background">
        <header className="sticky top-0 z-20 flex h-(--header-height) items-center gap-2 border-b border-border/70 bg-card/95 px-4 backdrop-blur">
          <SidebarTrigger
            aria-label={isMobile
              ? openMobile ? 'Fechar navegação' : 'Abrir navegação'
              : sidebarState === 'expanded' ? 'Recolher navegação' : 'Expandir navegação'}
            title={isMobile
              ? openMobile ? 'Fechar navegação (Ctrl+B)' : 'Abrir navegação (Ctrl+B)'
              : sidebarState === 'expanded' ? 'Recolher navegação (Ctrl+B)' : 'Expandir navegação (Ctrl+B)'}
            className="size-8 text-muted-foreground"
          />
          <Separator orientation="vertical" className="h-5!" />
          <div className="flex items-center gap-2 text-xs min-w-0">
            <span className="text-muted-foreground hidden sm:block">Análises públicas</span>
            <ChevronRight className="text-muted-foreground size-3 hidden sm:block" />
            <span className="font-medium truncate">{current.label}</span>
          </div>

          <div className="flex items-center ml-auto gap-3">
            {path === '/analitico' && (
              <>
                <OverviewFilters />
                <Button variant="outline" size="sm" className="size-8 px-0 sm:h-9 sm:w-auto sm:px-3" aria-label="Compartilhar recorte" onClick={async () => {
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
              className="size-8"
              disabled={state === 'loading'}
              onClick={() => setSearch(true)}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </header>

        <div id="main-content" tabIndex={-1} className="analytics-page-content page-content flex flex-col outline-none">
          {children}
          <footer className="mt-auto pt-10 text-xs text-muted-foreground">
            <div className="flex flex-col gap-4 border-t py-5 lg:flex-row lg:items-center lg:justify-between">
              <nav aria-label="Navegação do rodapé" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {[['Visão geral', '/analitico'], ['Empenhos', '/analitico/empenhos'], ['Fornecedores', '/analitico/fornecedores'], ['Metodologia', '/analitico/metodologia']].map(([label, href]) => <Button key={href} variant="link" disabled={state === 'loading'} className="h-auto min-h-0 p-0 text-xs font-normal text-muted-foreground hover:text-primary" onClick={() => navigate(href)}>{label}</Button>)}
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-t py-4 text-[0.6875rem] text-muted-foreground/80">
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
      <SidebarProvider
        className="analytics-shell-scale"
        style={
          {
            '--sidebar-width': 'var(--sidebar-size)',
            '--sidebar-width-icon': 'var(--rail-size)',
            '--sidebar-height': '100svh',
          } as CSSProperties
        }
      >
        <ShellContent>{children}</ShellContent>
      </SidebarProvider>
    </>
  );
}
