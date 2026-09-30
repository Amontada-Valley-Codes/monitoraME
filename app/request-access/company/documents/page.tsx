'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stepper } from '@/components/ui/stepper'
import { Button } from '@/components/ui/button'
import { FileUploadCard } from '@/components/ui/file-upload-card'
import { useCompanyAccess } from '@/features/company-access/company-access-state'
import { submitCompanyAccessRequest } from '@/features/company-access/company-access-api'
import { CompanyReviewFormData } from '@/features/company-access/types'

export default function DocumentsPage() {
  const router = useRouter()
  const { formData } = useCompanyAccess()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [docs, setDocs] = useState<Record<string, { file: File | null, status: 'missing' | 'selected' }>>({
    contract: { file: null, status: 'missing' },
    cnpj: { file: null, status: 'missing' },
    id: { file: null, status: 'missing' },
  })

  const handleFileSelect = (key: string, file: File) => {
    setDocs(prev => ({ ...prev, [key]: { file, status: 'selected' } }))
  }

  const handleRemove = (key: string) => {
    setDocs(prev => ({ ...prev, [key]: { file: null, status: 'missing' } }))
  }

  const isReadyToSubmit = docs.contract.status === 'selected' && docs.cnpj.status === 'selected' && docs.id.status === 'selected'

  const handleSubmit = async () => {
    if (!isReadyToSubmit) return
    setIsSubmitting(true)
    try {
      const req = await submitCompanyAccessRequest(formData as CompanyReviewFormData, [])
      router.push(`/access-requests/${req.protocol}`)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Validação Documental</h1>
        <Stepper currentStep={3} />
        
        <div className="p-4 bg-info/10 border border-info rounded-md text-info-foreground text-sm mb-6">
          O envio da documentação é <strong>obrigatório</strong> para validar o perfil de Fornecedor, mesmo que o CNPJ tenha sido localizado automaticamente. Os arquivos serão analisados manualmente por nossa equipe.
        </div>

        <div className="space-y-4 mb-8">
          <FileUploadCard 
            title="Contrato Social" 
            description="Última alteração consolidada ou Requerimento de Empresário" 
            required 
            status={docs.contract.status} 
            fileName={docs.contract.file?.name}
            onFileSelect={(f) => handleFileSelect('contract', f)} 
            onRemove={() => handleRemove('contract')} 
          />
          <FileUploadCard 
            title="Cartão CNPJ" 
            description="Comprovante de Inscrição e de Situação Cadastral atualizado" 
            required 
            status={docs.cnpj.status} 
            fileName={docs.cnpj.file?.name}
            onFileSelect={(f) => handleFileSelect('cnpj', f)} 
            onRemove={() => handleRemove('cnpj')} 
          />
          <FileUploadCard 
            title="Documento de Identificação" 
            description="RG, CNH ou Passaporte do representante legal informado na etapa 2" 
            required 
            status={docs.id.status} 
            fileName={docs.id.file?.name}
            onFileSelect={(f) => handleFileSelect('id', f)} 
            onRemove={() => handleRemove('id')} 
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => router.push('/request-access/company/review')}>Voltar para Etapa 2</Button>
          <Button onClick={handleSubmit} disabled={!isReadyToSubmit || isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar solicitação para análise'}
          </Button>
        </div>
      </div>
    </main>
  )
}