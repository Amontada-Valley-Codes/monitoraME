import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/shared/components/logo';

export function OpportunityFeedHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-(--header-height) items-center justify-between px-4 sm:px-6">
        <Logo className="h-6 w-auto text-brand-ink sm:hidden" />
        <h1 className="hidden text-xl font-semibold text-foreground sm:block">
          Oportunidades em Aberto
        </h1>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Configurações do feed"
        >
          <Settings2 className="size-4 text-muted-foreground" />
        </Button>
      </div>

      <nav className="flex px-2 text-sm font-medium" aria-label="Filtros do feed">
        <button className="relative flex-1 py-3 text-foreground transition-colors hover:bg-muted/60">
          Para Você
          <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-primary" />
        </button>

        <button className="flex-1 py-3 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          Recentes PNCP
        </button>

        <button className="flex-1 py-3 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          Dispensas
        </button>
      </nav>
    </header>
  );
}
