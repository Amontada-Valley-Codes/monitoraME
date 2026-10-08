'use client'
import { Suspense, useEffect, useState, use } from 'react'
import { getAccessRequest } from '@/features/company-access/company-access-api'
import { AccessRequest } from '@/features/company-access/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

const statusConfig = {
  under_review: { label: 'Em Análise', icon: Clock, color: 'text-warning', bg: 'bg-warning/10 border-warning' },
  action_required: { label: 'Ação Necessária', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive' },
  approved: { label: 'Aprovado', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10 border-success' },
  rejected: { label: 'Recusado', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted border-border' },
  draft: { label: 'Rascunho', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted border-border' },
}

export default function ProtocolStatusPage({ params }: { params: Promise<{ protocol: string }> }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando protocolo...</div>}><ProtocolStatusContent params={params} /></Suspense>
}

function ProtocolStatusContent({ params }: { params: Promise<{ protocol: string }> }) {
  const resolvedParams = use(params)
  const [request, setRequest] = useState<AccessRequest | null>(null)

  useEffect(() => {
    getAccessRequest(resolvedParams.protocol).then(setRequest)
  }, [resolvedParams.protocol])

  if (!request) return <div className="min-h-screen flex items-center justify-center">Carregando protocolo...</div>

  const config = statusConfig[request.status]
  const StatusIcon = config.icon

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">Início / Solicitações / {request.protocol}</nav>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Acompanhamento de habilitação empresarial</h1>
            <p className="font-mono text-muted-foreground mt-1">Protocolo: {request.protocol}</p>
          </div>
          <Badge variant="outline" className={`px-3 py-1.5 border ${config.bg} ${config.color} text-sm font-medium`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {config.label}
          </Badge>
        </div>

        <section className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-4">Resumo da Empresa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground block">Razão Social</span><span className="font-medium">{request.company.legalName}</span></div>
            <div><span className="text-muted-foreground block">CNPJ</span><span className="font-medium">{request.company.cnpj.replace(/^(\d{2}).*/, '$1.***.***/****-**')}</span></div>
            <div><span className="text-muted-foreground block">CNAE Principal</span><span className="font-medium">{request.company.primaryCnae?.code || 'N/I'}</span></div>
            <div><span className="text-muted-foreground block">Localidade</span><span className="font-medium">{request.company.address?.city}</span></div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Linha do Tempo</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
            {request.timeline.map((event) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${event.status === 'completed' ? 'bg-success' : event.status === 'current' ? 'bg-primary' : 'bg-muted'}`}>
                  {event.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-surface shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-sm ${event.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>{event.label}</h3>
                    {event.occurredAt && <time className="text-xs text-muted-foreground font-mono">{new Date(event.occurredAt).toLocaleDateString('pt-BR')}</time>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {request.status === 'under_review' && (
          <div className="mt-8 flex justify-end">
            <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border">Cancelar Solicitação</Button>
          </div>
        )}
        
        {request.status === 'approved' && (
          <div className="mt-8 flex justify-end">
            <Button>Configurar preferências de oportunidades</Button>
          </div>
        )}
      </div>
    </main>
  )
}
