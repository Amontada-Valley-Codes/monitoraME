import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function KpiCard({
  label,
  value,
  detail,
  change,
  icon: Icon,
  sizeScope = 'Todos',
  highlight = false,
  inverse = false,
}: {
  label: string;
  value: string;
  detail: string;
  change: number | null;
  icon: LucideIcon;
  sizeScope?: string;
  originScope?: string;
  highlight?: boolean;
  inverse?: boolean;
}) {
  void change;
  void inverse;

  return (
    <Card
      className={`min-h-40 gap-0 overflow-hidden py-0 shadow-none ${
        highlight ? 'border-primary/30 bg-secondary/40' : ''
      }`}
    >
      <CardContent className="flex min-h-40 flex-col p-0">
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug text-muted-foreground">
              {label}
            </p>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${
                highlight
                  ? 'border-primary/20 bg-primary/10 text-primary'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <Icon className="size-4" />
            </span>
          </div>
          <div
            className={`metric mt-4 whitespace-nowrap text-3xl xl:text-[2.125rem] ${
              highlight ? 'text-primary' : ''
            }`}
          >
            {value}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </div>
        <p className="border-t bg-muted/20 px-5 py-2.5 text-xs text-muted-foreground">
          Porte: {sizeScope}
        </p>
      </CardContent>
    </Card>
  );
}
