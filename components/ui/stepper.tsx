import { Check } from 'lucide-react'

export function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = ['Identificação', 'Revisão Cadastral', 'Validação Documental']

  return (
    <nav aria-label="Progresso da habilitação" data-slot="stepper" className="mb-8">
      <ol className="flex items-center w-full">
        {steps.map((label, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <li key={label} className={`flex w-full items-center ${index !== steps.length - 1 ? 'after:content-[""] after:w-full after:h-1 after:border-b after:border-border after:border-4 after:inline-block' : ''}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full lg:h-10 lg:w-10 shrink-0 ${isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </span>
              <span className="sr-only">{isCurrent ? 'Etapa atual: ' : ''}{label}</span>
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-sm text-foreground-subtle font-medium">Etapa {currentStep} de 3: {steps[currentStep - 1]}</p>
    </nav>
  )
}