'use client';

import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPinned,
  ReceiptText,
  Building2,
  ArrowLeftRight,
  Target,
  Files,
  Database,
  BookOpen,
  Search,
  ChevronRight,
  RefreshCw,
  ChartNoAxesCombined,
  Globe,
  Command as CommandIcon,
  User,
  CircleDollarSign,
} from 'lucide-react';
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
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Toaster } from '@/components/ui/sonner';
import { LogoIcon, LogoContent } from '@/shared/components/logo';
import { useAnalytics } from '@/features/analytics/data/context';
import { MUNICIPALITIES, SUPPLIERS } from '@/features/analytics/data/fixtures';

export const NAV = [
  { path: '/', label: 'Visão geral', icon: LayoutDashboard },
  { path: '/analitico/municipios', label: 'Municípios', icon: MapPinned },
  { path: '/analitico/despesas', label: 'Despesas empenhadas', icon: ReceiptText },
  { path: '/analitico/fornecedores', label: 'Fornecedores', icon: Building2 },
  { path: '/analitico/territorio', label: 'Análise territorial', icon: Globe },
  { path: '/analitico/comparar', label: 'Comparar resultados', icon: ArrowLeftRight },
  { path: '/analitico/metas', label: 'Metas de gestão', icon: Target },
  { path: '/analitico/relatorios', label: 'Relatórios', icon: Files },
  { path: '/analitico/qualidade', label: 'Qualidade da base', icon: Database },
  { path: '/analitico/metodologia', label: 'Metodologia e fontes', icon: BookOpen },
];

const PLANS_PAGE = {
  path: '/analitico/planos',
  label: 'Planos',
  icon: CircleDollarSign,
};

function Navigation() {
  const path = usePathname();
  const { navigate } = useAnalytics();
  const { setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    const media = window.matchMedia('(min-width:1280px)');
    const change = () => setOpen(media.matches);
    change();
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, [setOpen]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-(--header-height) justify-center border-b px-5">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="p-0 justify-start hover:bg-transparent"
          aria-label="MonitoraME início"
        >
          <LogoIcon className="size-7 text-primary shrink-0" />
          <LogoContent className="size-auto! h-6! w-36! text-navy group-data-[collapsible=icon]:hidden" />
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="pt-5">
          <SidebarGroupLabel className="eyebrow mb-3 text-muted-foreground">
            Poder Público
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {NAV.slice(0, 6).map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  tooltip={item.label}
                  isActive={item.path === '/' ? path === '/' : path.startsWith(item.path)}
                  onClick={() => {
                    navigate(item.path);
                    setOpenMobile(false);
                  }}
                  className="min-h-11 gap-3 text-sm data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:font-medium"
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
  const { navigate, reload, state } = useAnalytics();
  const [search, setSearch] = useState(false);

  const current = path.startsWith(PLANS_PAGE.path)
    ? PLANS_PAGE
    : NAV.find((n) => (n.path === '/' ? path === '/' : path.startsWith(n.path))) ?? NAV[0];

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setSearch(false);
  };

  return (
    <>
      <Navigation />
      <SidebarInset className="min-w-0 bg-background">
        <header className="h-(--header-height) border-b bg-card px-4 sm:px-8 flex items-center gap-3 sticky top-0 z-20">
          <SidebarTrigger
            aria-label="Abrir ou recolher navegação"
            className="size-10 text-muted-foreground"
          />
          <Separator orientation="vertical" className="h-5!" />
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-muted-foreground hidden sm:block">Poder Público</span>
            <ChevronRight className="text-muted-foreground size-3 hidden sm:block" />
            <span className="font-medium truncate">{current.label}</span>
          </div>

          <div className="flex items-center ml-auto gap-3">
            <Button
              variant="outline"
              className="text-muted-foreground bg-background gap-3 hidden lg:flex min-w-64 justify-start"
              onClick={() => setSearch(true)}
            >
              <Search className="size-4" />
              <span className="font-normal">Buscar no MonitoraME</span>
              <span className="ml-auto text-xs font-mono border rounded px-1.5 py-0.5">⌘ K</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar no MonitoraME"
              className="lg:hidden"
              onClick={() => setSearch(true)}
            >
              <Search className="size-4" />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Atualizar consulta"
                  onClick={reload}
                  disabled={state === 'loading'}
                >
                  <RefreshCw
                    className={`size-4 text-muted-foreground ${
                      state === 'loading' ? 'animate-spin' : ''
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar consulta</TooltipContent>
            </Tooltip>
            <Button
              variant={path.startsWith(PLANS_PAGE.path) ? 'secondary' : 'outline'}
              size="sm"
              aria-label="Abrir planos"
              onClick={() => navigate(PLANS_PAGE.path)}
            >
              <CircleDollarSign className="size-4 text-primary" />
              <span className="hidden sm:inline text-primary">Planos</span>
            </Button>
          </div>
        </header>

        <div id="main-content" tabIndex={-1} className="page-content outline-none">
          {children}
          <footer className="mt-10 pt-5 border-t flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
            <span>MonitoraME · Inteligência em compras públicas</span>
            <Button
              variant="link"
              className="text-xs p-0 min-h-0 h-auto text-muted-foreground"
              onClick={() => navigate('/analitico/metodologia')}
            >
              Fontes, recortes e metodologia
              <ChevronRight className="size-3" />
            </Button>
          </footer>
        </div>
      </SidebarInset>

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
                onSelect={() => go('/analitico/municipios/' + m.id)}
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

      <Toaster position="bottom-right" />
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
        style={
          {
            '--sidebar-width': 'var(--sidebar-size)',
            '--sidebar-width-icon': 'var(--rail-size)',
          } as CSSProperties
        }
      >
        <ShellContent>{children}</ShellContent>
      </SidebarProvider>
    </>
  );
}
