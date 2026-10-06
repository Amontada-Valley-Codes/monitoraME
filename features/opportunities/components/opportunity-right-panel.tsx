import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function OpportunityRightPanel() {
  return (
    <aside className="hidden w-80 shrink-0 bg-background px-5 py-6 lg:block 2xl:w-96 2xl:px-6">
      <div className="sticky top-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Buscar órgãos, atas e certames"
            placeholder="Buscar órgãos, atas e certames..."
            className="bg-card pl-9"
          />
        </div>

        <Card className="mt-4 gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle className="text-lg">Inteligência MonitoraME Pro</CardTitle>
            <CardDescription className="leading-relaxed">
              Dados do PNCP são 100% livres e públicos. Tenha IA para resumir
              exigências de habilitação, pipeline Kanban de propostas e radar de
              concorrentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <Button>Conhecer recursos Pro</Button>
          </CardContent>
        </Card>

        <footer className="mt-5 border-t pt-4 text-xs leading-6 text-muted-foreground">
          <p>Termos de Serviço · Privacidade · LAI Ceará · Acessibilidade</p>
          <p className="mt-1">© 2026 MonitoraME. Dados Abertos TCE-CE &amp; PNCP</p>
        </footer>
      </div>
    </aside>
  );
}
