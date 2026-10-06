import Link from 'next/link';
import {
  Bookmark,
  BriefcaseBusiness,
  Ellipsis,
  LayoutDashboard,
  ListFilter,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Logo } from '@/shared/components/logo';

export function OpportunitySidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-(--sidebar-size) shrink-0 flex-col border-r bg-sidebar px-3 py-4 text-sidebar-foreground xl:flex">
      <div className="flex min-h-0 flex-1 flex-col">
        <Link
          href="/"
          className="flex h-10 items-center px-2"
          aria-label="MonitoraME — início"
        >
          <Logo className="h-5 w-auto text-brand-ink" />
        </Link>

        <div className="eyebrow mb-3 mt-8 px-3 text-muted-foreground">
          Oportunidades
        </div>

        <nav className="space-y-1" aria-label="Oportunidades">
          <Button asChild className="h-11 w-full justify-start gap-3 px-3">
            <Link href="/oportunidades" aria-current="page">
              <LayoutDashboard className="size-4" />
              <span>Editais abertos</span>
            </Link>
          </Button>

          <Button variant="ghost" className="h-11 w-full justify-start gap-3 px-3">
            <Bookmark className="size-4" />
            <span>Editais salvos</span>
          </Button>
        </nav>

        <div className="my-4 border-t" />

        <div className="eyebrow mb-3 px-3 text-muted-foreground">
          Gestão &amp; inteligência
        </div>

        <nav className="space-y-1" aria-label="Gestão e inteligência">
          <Button variant="ghost" className="h-11 w-full justify-start gap-3 px-3">
            <BriefcaseBusiness className="size-4 text-warning" />
            <span>Área da empresa</span>
            <Badge className="ml-auto px-1.5 py-0 text-[10px]">PRO</Badge>
          </Button>

          <Button variant="ghost" className="h-11 w-full justify-start gap-3 px-3">
            <UserRound className="size-4" />
            <span>Perfil fornecedor</span>
          </Button>

          <Button variant="ghost" className="h-11 w-full justify-start gap-3 px-3">
            <Ellipsis className="size-4" />
            <span>Mais opções</span>
          </Button>
        </nav>

        <Button className="mt-5 h-11 w-full gap-2">
          <ListFilter className="size-4" />
          Filtrar oportunidades
        </Button>
      </div>

      <div className="mt-4 rounded-xl border bg-muted/60 p-2.5">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background">
            SN
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-success" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              Soluções Nordeste
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              34.819.•••/0001-92
            </p>
          </div>

          <Ellipsis className="size-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
