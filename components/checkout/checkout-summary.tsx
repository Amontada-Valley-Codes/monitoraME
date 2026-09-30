import type { ReactNode } from 'react';
import { CalendarDays, Check, CircleDollarSign, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatPlanPrice, type CheckoutPlan } from './plans';

export function CheckoutSummary({ plan }: { plan: CheckoutPlan }) {
  const listPrice = plan.originalPriceInCents ?? plan.priceInCents;
  const discount = listPrice - plan.priceInCents;

  return (
    <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
      <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
        <CardHeader className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-4 border-b px-5 py-5">
          <div className="flex size-15 items-center justify-center rounded-lg border bg-secondary text-primary">
            <CircleDollarSign className="size-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">Plano {plan.name}</CardTitle>
            <span className="mt-1 inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-medium text-primary">Assinatura mensal</span>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <dl className="space-y-4 px-5 py-5 text-sm">
            <SummaryRow icon={<CalendarDays />} label="Ciclo" value="Mensal" />
            <SummaryRow icon={<RefreshCw />} label="Renovação" value="Automática" />
            <SummaryRow icon={<Check />} label="Recursos" value={`${plan.features.length} incluídos`} />
          </dl>
          <div className="space-y-3 border-t px-5 py-4 text-sm">
            {discount > 0 && (
              <>
                <div className="flex items-center justify-between gap-4 text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPlanPrice(listPrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-success">
                  <span>Desconto</span>
                  <span>− {formatPlanPrice(discount)}</span>
                </div>
              </>
            )}
            <div className={cn('flex items-center justify-between gap-4', discount > 0 && 'border-t pt-4')}>
              <strong className="text-base">Total</strong>
              <div className="text-right">
                <strong className="metric block text-xl">{formatPlanPrice(plan.priceInCents)}</strong>
                <span className="text-xs text-muted-foreground">por mês</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="ml-auto font-medium text-foreground">{value}</dd>
    </div>
  );
}
