'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  List,
  LogOut,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NotificationBell } from './notification-bell';
import { useNotifications } from '../notification-context';
import { companyDemoFixture } from '../demo-fixture';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  {
    href: '/oportunidades',
    label: 'Encontrar editais',
    icon: LayoutDashboard,
    exact: true,
  },
];

const savedOpportunityViews = [
  {
    href: '/oportunidades/salvos?visualizacao=agenda',
    view: 'agenda',
    label: 'Agenda',
    icon: List,
  },
  {
    href: '/oportunidades/salvos?visualizacao=calendar',
    view: 'calendar',
    label: 'Calendário',
    icon: CalendarDays,
  },
  {
    href: '/oportunidades/salvos?visualizacao=kanban',
    view: 'kanban',
    label: 'Kanban',
    icon: Columns3,
  },
] as const;

const intelligence = [
  {
    href: '/analitico',
    label: 'Inteligência de mercado',
    icon: BarChart3,
  },
];

const opportunitySections = new Set(['salvos', 'notificacoes', 'perfil']);

const isOpportunityDetail = (pathname: string) => {
  const match = pathname.match(/^\/oportunidades\/([^/]+)$/);
  return match !== null && !opportunitySections.has(match[1]);
};

const isCurrent = (pathname: string, href: string, exact?: boolean) =>
  exact
    ? pathname === href || isOpportunityDetail(pathname)
    : pathname === href || pathname.startsWith(`${href}/`);

function OpportunityNavigation({
  onOpenSearch,
  active = 'open',
}: {
  onOpenSearch?: () => void;
  active?: 'open' | 'saved' | 'portfolio' | 'notifications';
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile, setOpen, setOpenMobile, state } = useSidebar();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const company = companyDemoFixture.company;
  const isSavedOpportunities = pathname === '/oportunidades/salvos';
  const [savedMenuOpen, setSavedMenuOpen] = useState(isSavedOpportunities);
  const savedView = searchParams.get('visualizacao') ?? 'calendar';

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const logout = async () => {
    setLoggingOut(true);

    try {
      await fetch('/api/session', { method: 'DELETE' });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="flex h-(--header-height) items-center justify-center border-b border-sidebar-border px-3 group-data-[collapsible=icon]:px-0">
        <div className="flex w-full items-center justify-center gap-2 group-data-[collapsible=icon]:px-0">
          <Link
            href="/"
            onClick={closeMobile}
            className="flex min-w-0 flex-1 items-center group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
            aria-label="MonitoraME — início"
          >
            {isMobile || state === 'expanded' ? (
              <>
                <Image
                  src="/brand/horizontal-dark.svg"
                  alt="MonitoraME"
                  width={613}
                  height={100}
                  priority
                  className="h-6 w-auto max-w-full dark:hidden"
                />
                <Image
                  src="/brand/horizontal-light.svg"
                  alt="MonitoraME"
                  width={613}
                  height={100}
                  priority
                  className="hidden h-6 w-auto max-w-full dark:block"
                />
              </>
            ) : (
              <Image
                src="/brand/app-icon.svg"
                alt="MonitoraME"
                width={100}
                height={100}
                priority
                className="size-7 shrink-0"
              />
            )}
          </Link>

          {isMobile && (
            <SidebarTrigger
              className="size-9 shrink-0"
              aria-label="Fechar menu"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 overflow-x-hidden overflow-y-auto px-2 py-2">
        <SidebarGroup className="pb-1 pt-0 group-data-[collapsible=icon]:px-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              closeMobile();
              onOpenSearch?.();
            }}
            aria-label="Busca rápida"
            className="flex h-10 w-full items-center justify-start gap-3 overflow-hidden bg-background px-3 font-normal text-muted-foreground shadow-none group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0"
          >
            <Search className="size-4 shrink-0" />

            <span className="truncate group-data-[collapsible=icon]:hidden">
              Busca rápida
            </span>

            <span className="ml-auto shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] group-data-[collapsible=icon]:hidden">
              Ctrl K
            </span>
          </Button>
        </SidebarGroup>

        <SidebarSeparator className="my-0" />
        <nav aria-label="Atalhos da carteira">
          <Button asChild variant={active === 'portfolio' ? 'default' : 'ghost'} className="h-11 w-full justify-start gap-3 px-3">
            <Link href="/oportunidades/carteira" aria-current={active === 'portfolio' ? 'page' : undefined}>
              <FolderKanban className="size-4" />
              <span>Minhas oportunidades</span>
            </Link>
          </Button>
        </nav>

        <SidebarSeparator />

        <SidebarGroup className="py-1.5">
          <SidebarGroupLabel className="h-7">Visão geral</SidebarGroupLabel>

          <SidebarMenu>
            {navigation.map(({ href, label, icon: Icon, exact }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  tooltip={label}
                  isActive={isCurrent(pathname, href, exact)}
                  className="h-10 gap-3 px-2.5 data-[active=true]:font-semibold"
                >
                  <Link href={href} onClick={closeMobile}>
                    <Icon />
                    <span>{label}</span>

                    {href === '/oportunidades/notificacoes' &&
                      unreadCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto h-5 min-w-5 px-1.5 text-[10px]"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            <Collapsible
              asChild
              open={savedMenuOpen}
              onOpenChange={setSavedMenuOpen}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Expandir editais salvos"
                    isActive={isSavedOpportunities}
                    onClick={() => {
                      if (!isMobile && state === 'collapsed') setOpen(true);
                    }}
                    className="h-10 gap-3 px-2.5 data-[active=true]:font-semibold"
                  >
                    <Bookmark />
                    <span>Editais salvos</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/menu-item:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub className="mt-1 gap-0.5 pb-1">
                    {savedOpportunityViews.map(({ href, view, label, icon: Icon }) => (
                      <SidebarMenuSubItem key={view}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSavedOpportunities && savedView === view}
                          className="h-8 gap-2.5 rounded-md"
                        >
                          <Link href={href} onClick={closeMobile}>
                            <Icon />
                            <span>{label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-0" />

        <SidebarGroup className="py-1.5">
          <SidebarGroupLabel className="h-7">Gestão e inteligência</SidebarGroupLabel>

          <SidebarMenu>
            {intelligence.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  tooltip={label}
                  className="h-10 gap-3 px-2.5"
                >
                  <Link href={href} onClick={closeMobile}>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
        <div className="overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-background to-secondary p-3 shadow-sm group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-background text-primary shadow-sm">
              <Sparkles className="size-4" />
            </span>

            <div>
              <p className="text-[10px] text-muted-foreground">Plano atual</p>
              <p className="text-xs font-semibold text-foreground">
                Demonstração Pro
              </p>
            </div>
          </div>

          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Organize editais e acompanhe oportunidades compatíveis.
          </p>

          <Button asChild size="sm" className="mt-2 h-8 w-full text-xs">
            <Link href="/analitico/planos">Aderir a um plano</Link>
          </Button>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Menu da conta"
                  aria-label="Abrir menu da conta"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
                    NC
                  </span>

                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-xs font-semibold">
                      {company.tradeName}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      Conta demonstrativa
                    </span>
                  </span>

                  <ChevronsUpDown className="ml-auto text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side={isMobile ? 'top' : 'right'}
                align="end"
                sideOffset={8}
                className="w-72"
              >
                <DropdownMenuLabel className="p-2 font-normal">
                  <span className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                      NC
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-sm font-semibold">
                        {company.tradeName}
                      </span>
                      <span className="mt-1 block break-all text-xs font-normal text-muted-foreground">
                        {company.email}
                      </span>
                    </span>
                  </span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/oportunidades/perfil" onClick={closeMobile}>
                    <UserRound />
                    Perfil da empresa
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  disabled={loggingOut}
                  onSelect={logout}
                >
                  <LogOut />
                  {loggingOut ? 'Saindo…' : 'Sair'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function OpportunitySidebar({ active = 'open' }: { active?: 'open' | 'saved' | 'portfolio' | 'notifications' }) {
  return <OpportunityNavigation active={active} />;
}

function OpportunityShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const current = [...navigation, ...intelligence].find((item) =>
    item.href === '/oportunidades'
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const currentLabel = pathname === '/oportunidades/salvos'
    ? 'Editais salvos'
    : pathname === '/oportunidades/perfil'
      ? 'Perfil da empresa'
      : current?.label ?? 'Detalhes do edital';

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const goTo = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <>
      <OpportunityNavigation onOpenSearch={() => setSearchOpen(true)} />

      <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden bg-background">
        <header className="z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/70 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-5">
          <SidebarTrigger
            className="size-9 text-muted-foreground"
            aria-label="Alternar menu lateral"
          />

          <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

          <div className="min-w-0">
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Área da empresa
            </p>
            <p className="truncate text-sm font-semibold">
              {currentLabel}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
          </div>
        </header>

        <div
          id="main-content"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none"
        >
          {children}
        </div>
      </SidebarInset>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Navegar no MonitoraME"
        description="Busque páginas e funcionalidades da plataforma."
      >
        <CommandInput placeholder="Buscar calendário, editais, indicadores..." />

        <CommandList>
          <CommandEmpty>Nenhuma funcionalidade encontrada.</CommandEmpty>

          <CommandGroup heading="Oportunidades">
            <CommandItem onSelect={() => goTo('/oportunidades')}>
              <LayoutDashboard />
              <span>Encontrar editais</span>
              <CommandShortcut>Oportunidades</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => goTo('/oportunidades/salvos')}>
              <Bookmark />
              <span>Editais salvos</span>
            </CommandItem>

            <CommandItem
              onSelect={() => goTo('/oportunidades/notificacoes')}
            >
              <Bell />
              <span>Central de notificações</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Organização">
            <CommandItem
              onSelect={() =>
                goTo('/oportunidades/salvos?visualizacao=calendar')
              }
            >
              <CalendarDays />
              <span>Calendário de prazos</span>
              <CommandShortcut>Salvos</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                goTo('/oportunidades/salvos?visualizacao=agenda')
              }
            >
              <List />
              <span>Agenda de oportunidades</span>
              <CommandShortcut>Salvos</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                goTo('/oportunidades/salvos?visualizacao=kanban')
              }
            >
              <Columns3 />
              <span>Pipeline Kanban</span>
              <CommandShortcut>Salvos</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Inteligência e conta">
            <CommandItem onSelect={() => goTo('/analitico')}>
              <BarChart3 />
              <span>Inteligência de mercado</span>
            </CommandItem>

            <CommandItem onSelect={() => goTo('/oportunidades/perfil')}>
              <UserRound />
              <span>Perfil da empresa</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function OpportunityShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>

      <SidebarProvider
        className="h-svh min-h-0 overflow-hidden"
        style={
          {
            '--sidebar-width': '16rem',
            '--sidebar-width-icon': '4rem',
            '--sidebar-height': '100svh',
          } as CSSProperties
        }
      >
        <OpportunityShellContent>{children}</OpportunityShellContent>
      </SidebarProvider>
    </>
  );
}
