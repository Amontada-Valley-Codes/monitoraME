import { Stepper } from '../../../components/ui/stepper'
import { CompanyReviewForm } from '../../../features/company-access/company-review-form'

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Revisão Cadastral</h1>
        <Stepper currentStep={2} />
        
        <div className="p-4 bg-muted border border-border rounded-md text-foreground-subtle text-sm mb-6">
          Verifique os dados importados da Receita Federal e preencha as informações de contato do representante legal.
        </div>

        <CompanyReviewForm />
      </div>
    </main>
  )
}