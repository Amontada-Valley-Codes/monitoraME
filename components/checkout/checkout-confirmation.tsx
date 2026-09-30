import type { ReactNode } from 'react';
import { ArrowRight, Check, CreditCard, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPlanPrice, type CheckoutPlan } from './plans';
import type { PaymentMethod } from './payment-step';

export function CheckoutConfirmation({ plan, method, onAccessPlatform }: { plan: CheckoutPlan; method: PaymentMethod; onAccessPlatform: () => void }) {
  const date = new Intl.DateTimeFormat('pt-BR').format(new Date());
  return (
    <Card className="mx-auto max-w-2xl shadow-none">
      <CardContent className="flex flex-col items-center px-5 py-4 text-center sm:px-10 sm:py-8">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-success-soft text-success"><Check className="size-8" strokeWidth={2.5} aria-hidden="true" /></div>
        <p className="eyebrow mb-2 text-success">Pagamento aprovado</p>
        <h2 className="text-2xl font-bold sm:text-3xl">Assinatura confirmada!</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Seu plano foi ativado com sucesso. Todos os recursos já estão disponíveis para sua conta.</p>
        <dl className="my-8 grid w-full gap-4 rounded-lg border bg-muted/30 p-5 text-left sm:grid-cols-2">
          <Detail label="Plano" value={plan.name} />
          <Detail label="Valor" value={`${formatPlanPrice(plan.priceInCents)} / mês`} />
          <Detail label="Forma de pagamento" value={method === 'pix' ? 'PIX' : 'Cartão de crédito'} icon={method === 'pix' ? <QrCode /> : <CreditCard />} />
          <Detail label="Data da assinatura" value={date} />
        </dl>
        <Button size="lg" onClick={onAccessPlatform}>Acessar plataforma <ArrowRight data-icon="inline-end" /></Button>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return <div><dt className="mb-1 text-xs text-muted-foreground">{label}</dt><dd className="flex items-center gap-2 text-sm font-semibold [&_svg]:size-4 [&_svg]:text-primary">{icon}{value}</dd></div>;
}
