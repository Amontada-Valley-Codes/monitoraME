'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { companyReviewSchema } from '@/features/company-access/schemas'
import { CompanyReviewFormData } from '@/features/company-access/types'
import { useCompanyAccess } from '@/features/company-access/company-access-state'
import { saveCompanyAccessDraft } from '@/features/company-access/company-access-api'

export function CompanyReviewForm() {
  const router = useRouter()
  const { formData, updateFormData } = useCompanyAccess()
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompanyReviewFormData>({
    resolver: zodResolver(companyReviewSchema),
    defaultValues: formData as CompanyReviewFormData,
  })

  const onSubmit = (data: CompanyReviewFormData) => {
    updateFormData(data)
    router.push('/request-access/company/documents')
  }

  const handleSaveDraft = async () => {
    await saveCompanyAccessDraft(formData)
    alert('Rascunho salvo com sucesso!')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Dados Cadastrais Oficiais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Razão Social</label>
            <Input {...register('legalName')} disabled className="bg-muted" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">CNPJ</label>
            <Input {...register('cnpj')} disabled className="bg-muted" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Contato e Representação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome do Representante Legal</label>
            <Input {...register('legalRepresentativeName')} placeholder="Nome completo" aria-invalid={!!errors.legalRepresentativeName} />
            {errors.legalRepresentativeName && <p className="text-xs text-destructive mt-1">{errors.legalRepresentativeName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">CPF do Representante</label>
            <Input {...register('legalRepresentativeCpf')} placeholder="000.000.000-00" aria-invalid={!!errors.legalRepresentativeCpf} />
            {errors.legalRepresentativeCpf && <p className="text-xs text-destructive mt-1">{errors.legalRepresentativeCpf.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">E-mail para Notificações</label>
            <Input type="email" {...register('notificationEmail')} placeholder="contato@empresa.com" />
            {errors.notificationEmail && <p className="text-xs text-destructive mt-1">{errors.notificationEmail.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Telefone/WhatsApp Comercial</label>
            <Input {...register('commercialPhone')} placeholder="(00) 00000-0000" />
            {errors.commercialPhone && <p className="text-xs text-destructive mt-1">{errors.commercialPhone.message}</p>}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.push('/request-access/company/identify')}>Voltar para Etapa 1</Button>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button type="button" variant="ghost" onClick={handleSaveDraft}>Salvar rascunho</Button>
          <Button type="submit" disabled={isSubmitting}>Confirmar e avançar para documentos</Button>
        </div>
      </div>
    </form>
  )
}