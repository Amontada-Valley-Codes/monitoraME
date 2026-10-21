'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, LayoutDashboard, Radar, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/shared/components/logo';

type NavItem = { href: string; label: string; icon: LucideIcon };

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard },
];

const PLATFORM_NAV: NavItem[] = [
  { href: '/oportunidades', label: 'Oportunidades', icon: Radar },
  { href: '/analitico', label: 'Painel analítico', icon: BarChart3 },
];

const isActive = (pathname: string, href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return items.map(({ href, label, icon: Icon }) => (
    <Button key={href} asChild variant={isActive(pathname, href) ? 'default' : 'ghost'} className="h-11 w-full justify-start gap-3 px-3">
      <Link href={href} aria-current={isActive(pathname, href) ? 'page' : undefined}>
        <Icon className="size-4" />
        <span>{label}</span>
      </Link>
    </Button>
  ));
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-(--sidebar-size) shrink-0 flex-col border-r bg-sidebar px-3 py-4 text-sidebar-foreground xl:flex">
        <Link href="/admin" className="flex h-10 items-center px-2" aria-label="MonitoraME — painel administrativo">
          <Logo className="h-5 w-auto text-brand-ink" />
        </Link>
        <div className="eyebrow mb-3 mt-6 px-3 text-muted-foreground">Administração</div>
        <nav className="space-y-1" aria-label="Administração">
          <NavLinks items={ADMIN_NAV} pathname={pathname} />
        </nav>
        <div className="my-4 border-t" />
        <div className="eyebrow mb-3 px-3 text-muted-foreground">Plataforma</div>
        <nav className="space-y-1" aria-label="Plataforma">
          <NavLinks items={PLATFORM_NAV} pathname={pathname} />
        </nav>
      </aside>

      <nav aria-label="Administração" className="flex gap-1 overflow-x-auto border-b bg-sidebar px-3 py-2 xl:hidden">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
          <Button key={href} asChild size="sm" variant={isActive(pathname, href) ? 'default' : 'ghost'}>
            <Link href={href} aria-current={isActive(pathname, href) ? 'page' : undefined}>
              <Icon />
              {label}
            </Link>
          </Button>
        ))}
      </nav>
    </>
  );
}
