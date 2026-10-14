'use client'
/* eslint-disable react-hooks/set-state-in-effect -- localStorage is hydrated after mount to keep the server render deterministic. */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bookmark, CalendarClock, CircleDollarSign, GripVertical, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban'
import { cn } from '@/lib/utils'
import {
  emptyOpportunityPipeline,
  readSavedOpportunities,
  SAVED_PIPELINE_KEY,
  type OpportunityPipeline,
  type OpportunityStage,
} from '@/features/opportunities/saved-opportunities'
import type { Opportunity } from '@/features/opportunities/types'

const stageMeta: Record<OpportunityStage, { title: string; description: string; dot: string }> = {
  saved: { title: 'Editais salvos', description: 'Novas oportunidades', dot: 'bg-blue-500' },
  preparing: { title: 'Em preparação', description: 'Documentos e proposta', dot: 'bg-amber-500' },
  submitted: { title: 'Proposta enviada', description: 'Acompanhar resultado', dot: 'bg-emerald-500' },
}

function OpportunityCard({ opportunity, overlay = false }: { opportunity: Opportunity; overlay?: boolean }) {
  const value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(opportunity.estimatedValue)
  const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(opportunity.openingDate))

  const content = (
    <article className={cn('rounded-xl border bg-card p-4 shadow-xs transition-shadow', !overlay && 'hover:shadow-sm')}>
      <div className="flex items-start justify-between gap-3">
        <Badge variant="outline" className="max-w-[80%] truncate">{opportunity.modality}</Badge>
        <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{opportunity.title}</h3>
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{opportunity.organization}</p>
      <div className="mt-4 space-y-2 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><CircleDollarSign className="size-3.5" />{value}</span>
        <span className="flex items-center gap-2"><CalendarClock className="size-3.5" />{date}</span>
        <span className="flex items-center gap-2"><MapPin className="size-3.5" />{opportunity.city} / {opportunity.state}</span>
      </div>
      <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
        <Link href={`/oportunidades/${opportunity.id}`}>Ver edital</Link>
      </Button>
    </article>
  )

  return <KanbanItem value={opportunity.id}>{overlay ? content : <KanbanItemHandle>{content}</KanbanItemHandle>}</KanbanItem>
}

function StageColumn({ stage, opportunities, overlay = false }: { stage: OpportunityStage; opportunities: Opportunity[]; overlay?: boolean }) {
  const meta = stageMeta[stage]
  return (
    <KanbanColumn value={stage}>
      <section className="flex min-h-[30rem] flex-col rounded-2xl border bg-muted/35 p-2">
        <header className="rounded-xl bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn('size-2 rounded-full', meta.dot)} />
            {meta.description}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{meta.title}</h2>
            <Badge variant="secondary">{opportunities.length}</Badge>
          </div>
        </header>
        <KanbanColumnContent value={stage} className="mt-2 flex flex-1 flex-col gap-2.5">
          {opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} overlay={overlay} />)}
          {!opportunities.length && !overlay && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
              Arraste um edital para esta etapa
            </div>
          )}
        </KanbanColumnContent>
      </section>
    </KanbanColumn>
  )
}

export default function SavedOpportunitiesKanban() {
  const [pipeline, setPipeline] = useState<OpportunityPipeline>(emptyOpportunityPipeline)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = readSavedOpportunities()
    let stored = emptyOpportunityPipeline()
    try {
      const raw = localStorage.getItem(SAVED_PIPELINE_KEY)
      if (raw) stored = { ...stored, ...JSON.parse(raw) }
    } catch {}

    const existingIds = new Set(Object.values(stored).flat().map((item) => item.id))
    stored.saved = [...saved.filter((item) => !existingIds.has(item.id)), ...stored.saved]
    setPipeline(stored)
    localStorage.setItem(SAVED_PIPELINE_KEY, JSON.stringify(stored))
    setLoaded(true)
  }, [])

  function updatePipeline(next: Record<string, Opportunity[]>) {
    const typed = next as OpportunityPipeline
    setPipeline(typed)
    localStorage.setItem(SAVED_PIPELINE_KEY, JSON.stringify(typed))
  }

  const total = Object.values(pipeline).flat().length
  if (!loaded) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />

  if (!total) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary"><Bookmark className="size-5" /></span>
        <h2 className="mt-4 font-semibold">Nenhum edital salvo</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">Salve uma oportunidade para começar a organizar sua proposta neste Kanban.</p>
        <Button asChild className="mt-5"><Link href="/oportunidades">Explorar oportunidades</Link></Button>
      </div>
    )
  }

  return (
    <Kanban value={pipeline} onValueChange={updatePipeline} getItemValue={(item) => item.id} className="overflow-x-auto pb-4">
      <KanbanBoard className="grid min-w-[54rem] grid-cols-3 gap-3">
        {(Object.entries(pipeline) as [OpportunityStage, Opportunity[]][]).map(([stage, opportunities]) => (
          <StageColumn key={stage} stage={stage} opportunities={opportunities} />
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        {({ value, variant }) => {
          if (variant === 'column') return <StageColumn stage={String(value) as OpportunityStage} opportunities={pipeline[String(value) as OpportunityStage]} overlay />
          const opportunity = Object.values(pipeline).flat().find((item) => item.id === String(value))
          return opportunity ? <OpportunityCard opportunity={opportunity} overlay /> : null
        }}
      </KanbanOverlay>
    </Kanban>
  )
}
