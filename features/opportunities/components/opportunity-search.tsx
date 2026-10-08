import { CalendarDays, MapPin, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const filters = [
  { label: 'Município', icon: MapPin },
  { label: 'Cota MPE', icon: Star },
  { label: 'Modalidade', icon: SlidersHorizontal },
  { label: 'Data', icon: CalendarDays },
];

export function OpportunitySearch() {
  return (
    <section className="border-b bg-card p-4 sm:p-6" aria-label="Buscar editais">
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          SN
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor="opportunity-search" className="sr-only">
            Buscar por objeto, CNAE ou município
          </label>
          <Input
            id="opportunity-search"
            type="search"
            placeholder="O que sua empresa quer fornecer hoje? Digite objeto, CNAE ou município..."
            className="bg-background"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <div className="flex items-center gap-1">
              {filters.map(({ label, icon: Icon }) => (
                <Button
                  key={label}
                  type="button"
                  variant="ghost"
                  size="icon"
                  title={label}
                  aria-label={label}
                  className="text-primary"
                >
                  <Icon className="size-4" />
                </Button>
              ))}
            </div>

            <Button type="button">Buscar editais</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
