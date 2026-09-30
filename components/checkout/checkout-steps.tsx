import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Revisão', 'Pagamento', 'Confirmação'];

export function CheckoutSteps({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <ol className="mx-auto grid w-full max-w-5xl grid-cols-3 px-2 sm:px-8" aria-label="Progresso do checkout">
      {STEPS.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        const isComplete = step < currentStep;
        const isActive = step === currentStep;

        return (
          <li key={label} className="relative flex flex-col items-center gap-2.5">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute right-1/2 top-4.5 h-px w-full bg-border transition-colors duration-300',
                  currentStep > index && 'bg-primary'
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex size-9 items-center justify-center rounded-lg border bg-card font-mono text-xs font-semibold text-muted-foreground transition-all duration-300',
                isActive && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/10',
                isComplete && 'border-primary bg-secondary text-primary'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {isComplete ? <Check className="size-4" aria-hidden="true" /> : step}
            </span>
            <span
              className={cn(
                'text-xs text-muted-foreground transition-colors sm:text-sm',
                (isActive || isComplete) && 'font-medium text-foreground'
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
