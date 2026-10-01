import type { ReactNode } from 'react';
import { ArrowLeft, Copy, CreditCard, LockKeyhole, QrCode, ShieldCheck } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatPlanPrice, type CheckoutPlan } from './plans';
import { createPixPayload } from './pix-payload';

export type PaymentMethod = 'pix' | 'card';
export type CardDetails = { number: string; name: string; expiry: string; cvv: string };

type Props = {
  plan: CheckoutPlan;
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  cardDetails: CardDetails;
  onCardDetailsChange: (details: CardDetails) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function PaymentStep({ plan, method, onMethodChange, cardDetails, onCardDetailsChange, onBack, onContinue }: Props) {
  const pixPayload = createPixPayload(plan);
  const setCardField = (field: keyof CardDetails, value: string) =>
    onCardDetailsChange({ ...cardDetails, [field]: value });

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      toast.success('Código PIX copiado.');
    } catch {
      toast.error('Não foi possível copiar o código PIX.');
    }
  };

  return (
    <div className="space-y-5">
      <Card className="gap-0 rounded-xl py-0 shadow-none">
        <CardHeader className="px-6 pb-3 pt-4">
          <CardTitle className="text-base">Forma de pagamento</CardTitle>
          <p className="text-sm text-muted-foreground mb-0">Escolha como deseja pagar sua assinatura.</p>
        </CardHeader>
        <CardContent className="px-6 pb-5 pt-2">
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Forma de pagamento">
            <PaymentMethodButton active={method === 'pix'} icon={<QrCode className="size-5" />} label="PIX" onClick={() => onMethodChange('pix')} />
            <PaymentMethodButton active={method === 'card'} icon={<CreditCard className="size-5" />} label="Cartão" onClick={() => onMethodChange('card')} />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
        <CardHeader className="border-b px-6 py-5">
          <CardTitle className="text-base">{method === 'pix' ? 'Pagamento via PIX' : 'Dados do cartão'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {method === 'pix' ? 'Escaneie o QR Code ou use o código copia e cola.' : 'Preencha os dados exatamente como aparecem no cartão.'}
          </p>
        </CardHeader>
        <CardContent className="px-6 py-5">
          {method === 'pix' ? (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div className="flex size-40 shrink-0 items-center justify-center rounded-lg border bg-card p-3 text-brand-ink shadow-xs">
                <QRCode
                  value={pixPayload}
                  title={`PIX do plano ${plan.name} no valor de ${formatPlanPrice(plan.priceInCents)}`}
                  level="M"
                  bgColor="var(--card)"
                  fgColor="var(--brand-ink)"
                  size={136}
                  className="h-auto w-full"
                />
              </div>
              <div className="space-y-3 text-center sm:text-left">
                <p className="max-w-md text-sm leading-6 text-muted-foreground">A identificação do plano e o valor indicado no resumo já estão incluídos no código.</p>
                <Input
                  aria-label="Código PIX copia e cola"
                  className="max-w-md font-mono text-xs"
                  value={pixPayload}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button variant="outline" onClick={copyPixCode}><Copy aria-hidden="true" /> Copiar código PIX</Button>
              </div>
            </div>
          ) : (
            <form id="card-payment-form" className="grid gap-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onContinue(); }}>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="card-number">Número do cartão</Label>
                <Input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={(event) => setCardField('number', event.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="card-name">Nome no cartão</Label>
                <Input id="card-name" autoComplete="cc-name" placeholder="Como aparece no cartão" value={cardDetails.name} onChange={(event) => setCardField('name', event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Validade</Label>
                <Input id="card-expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cardDetails.expiry} onChange={(event) => setCardField('expiry', event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvv">CVV</Label>
                <Input id="card-cvv" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="000" value={cardDetails.cvv} onChange={(event) => setCardField('cvv', event.target.value)} required />
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg bg-success-soft px-4 py-3 text-sm text-success">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Seus dados são protegidos e não são armazenados nesta demonstração.</p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar</Button>
        <Button type={method === 'card' ? 'submit' : 'button'} form={method === 'card' ? 'card-payment-form' : undefined} onClick={method === 'pix' ? onContinue : undefined}>
          <LockKeyhole aria-hidden="true" /> Confirmar pagamento
        </Button>
      </div>
    </div>
  );
}

function PaymentMethodButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onClick} className={cn('flex min-h-12 items-center justify-center gap-2 rounded-md border bg-card px-4 text-sm font-medium transition-all hover:border-primary/50 hover:bg-secondary/40', active && 'border-primary bg-secondary text-primary ring-1 ring-primary')}>
      {icon}{label}
    </button>
  );
}
