import { ArrowLeft, ArrowRight, CheckCircle2, Info, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type CheckoutPlan } from './plans';

export function PlanReview({ plan, onBack, onContinue }: { plan: CheckoutPlan; onBack: () => void; onContinue: () => void }) {
  return (
    <div className="space-y-5">
      <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
        <CardHeader className="border-b px-6 py-5">
          <CardTitle className="text-base">Detalhes do plano</CardTitle>
          <p className="text-sm text-muted-foreground">Confira o plano selecionado antes de continuar.</p>
        </CardHeader>
        <CardContent className="grid gap-5 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">Plano {plan.name}</h2>
              {plan.badge && <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-primary">{plan.badge}</span>}
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">{plan.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 rounded-xl py-0 shadow-none">
        <CardHeader className="px-6 pb-3 pt-5">
          <CardTitle className="text-base">Recursos incluídos</CardTitle>
          <p className="text-sm text-muted-foreground">Tudo o que sua equipe terá acesso com esta assinatura.</p>
        </CardHeader>
        <CardContent className="px-6 pb-5 pt-2">
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="gap-0 rounded-xl py-0 shadow-none">
        <CardHeader className="px-6 pb-3 pt-5">
          <CardTitle className="text-base">Descontos e cupons</CardTitle>
          <p className="text-sm text-muted-foreground">Cupons promocionais serão aplicados nesta etapa.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-6 pb-5 pt-2 sm:flex-row">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" placeholder="Código promocional" aria-label="Código promocional" />
          </div>
          <Button variant="outline">Aplicar</Button>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p><strong>Observação:</strong> confira o plano e os valores antes de continuar para o pagamento.</p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar aos planos</Button>
        <Button onClick={onContinue}>Continuar para pagamento <ArrowRight data-icon="inline-end" /></Button>
      </div>
    </div>
  );
}
