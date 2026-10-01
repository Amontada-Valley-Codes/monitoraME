import type { LucideIcon } from 'lucide-react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
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
  change = change !== null && Math.abs(change) < 0.05 ? 0 : change;
  const good =
    change === null || change === 0
      ? false
      : inverse
        ? change < 0
        : change > 0;
  const Trend =
    change === null || change === 0
      ? Minus
      : change > 0
        ? TrendingUp
        : TrendingDown;

  return (
    <Card
      className={`min-h-(--chart-compact-height) gap-0 py-0 shadow-none ${
        highlight ? 'border-primary/30 bg-secondary/40' : ''
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-snug text-muted-foreground">
            {label}
          </p>
          <Icon
            className={`size-5 shrink-0 ${
              highlight ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
        </div>
        <div
          className={`metric mt-4 text-2xl whitespace-nowrap xl:text-[1.75rem] ${
            highlight ? 'text-primary' : ''
          }`}
        >
          {value}
        </div>
        {/* <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              good ? 'text-success' : 'text-muted-foreground'
            }`}
          >
            <Trend className="size-3.5" />
          </span>
        </div> */}
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        <p className="mt-3 border-t pt-2 text-xs text-muted-foreground">
          Porte: {sizeScope}
        </p>
      </CardContent>
    </Card>
  );
}