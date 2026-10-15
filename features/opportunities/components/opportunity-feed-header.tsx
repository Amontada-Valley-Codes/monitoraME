import { Logo } from '@/shared/components/logo';
import { NotificationBell } from './notification-bell';

export function OpportunityFeedHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex min-h-(--header-height) items-center gap-2 px-2 sm:px-4">
        <Logo className="ml-2 h-6 w-auto shrink-0 text-brand-ink sm:hidden" />

        <nav className="flex min-w-0 flex-1 self-stretch text-sm font-medium" aria-label="Filtros do feed">
          <button className="relative flex-1 px-2 py-3 text-foreground transition-colors hover:bg-muted/60">
            Para Você
            <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-primary" />
          </button>

          <button className="flex-1 px-2 py-3 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
            Recentes PNCP
          </button>

          <button className="flex-1 px-2 py-3 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
            Dispensas
          </button>
        </nav>

        <NotificationBell />
      </div>
    </header>
  );
}
