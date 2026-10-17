'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bell, Building2, ChevronDown,
  CircleHelp, LayoutDashboard, MapPinned, PanelLeftClose, ReceiptText,
  RefreshCw, Settings2, ArrowLeftRight,
} from 'lucide-react';
import { useAnalytics } from '@/features/analytics/data/context';
import { LogoIcon } from '@/shared/components/logo';

const items = [
  { href: '/analitico', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/analitico/municipios', label: 'Municípios', icon: MapPinned },
  { href: '/analitico/territorio', label: 'Análise territorial', icon: ArrowUpRight },
  { href: '/analitico/comparar', label: 'Comparar', icon: ArrowLeftRight },
  { href: '/analitico/empenhos', label: 'Empenhos', icon: ReceiptText },
  { href: '/analitico/fornecedores', label: 'Fornecedores', icon: Building2 },
];

export function OverviewShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reload, state } = useAnalytics();

  return (
    <div className="overview-stage">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <div className="overview-window">
        <div className="overview-browser" aria-hidden="true">
          <div className="overview-traffic"><i /><i /><i /></div>
          <PanelLeftClose size={15} />
          <ChevronDown size={11} />
          <ArrowLeft size={15} />
          <ArrowRight size={15} />
          <div className="overview-address">monitorame.com.br <RefreshCw size={11} /></div>
          <span className="overview-browser-end">↗　＋　▢</span>
        </div>
        <div className="overview-application">
          <aside className="overview-sidebar" aria-label="Navegação de análises">
            <Link href="/" className="overview-brand"><LogoIcon className="size-6 text-[#2460bd]" /><span>MonitoraME</span><PanelLeftClose className="ml-auto size-4 text-[#818895]" /></Link>
            <nav className="overview-navigation" aria-label="Seções do analítico">
              {items.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className="overview-nav-link">
                  <Icon size={15} strokeWidth={1.7} /><span>{label}</span>{href !== '/analitico' && <ChevronDown size={12} className="ml-auto opacity-50" />}
                </Link>
              ))}
            </nav>
            <div className="overview-sidebar-bottom">
              <Link href="/analitico/metodologia" className="overview-nav-link"><Settings2 size={15} />Metodologia</Link>
              <a href="https://www.tce.ce.gov.br/" target="_blank" rel="noreferrer" className="overview-nav-link"><CircleHelp size={15} />Fonte TCE-CE</a>
            </div>
          </aside>
          <div className="overview-main">
            <header className="overview-topbar">
              <div className="overview-breadcrumb"><span>Compras públicas</span><span>/</span><strong>Visão geral</strong></div>
              <div className="overview-top-actions">
                <button type="button" className="overview-refresh" onClick={reload} disabled={state === 'loading'}><RefreshCw size={14} className={state === 'loading' ? 'animate-spin' : ''} /> Atualizar dados</button>
                <span className="overview-icon-round" aria-hidden="true"><Bell size={15} /></span>
                <span className="overview-avatar" aria-hidden="true">M</span>
              </div>
            </header>
            <main id="main-content" tabIndex={-1} className="overview-content">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
