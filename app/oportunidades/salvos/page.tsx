import { OpportunityRightPanel } from '@/features/opportunities/components/opportunity-right-panel'
import { OpportunitySidebar } from '@/features/opportunities/components/opportunity-sidebar'
import SavedOpportunitiesKanban from '@/components/shadcn-studio/kanban/kanban-04'

export default function SavedOpportunitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <OpportunitySidebar active="saved" />
        <main className="min-w-0 flex-1 border-r bg-card">
          <header className="border-b px-4 py-5 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Pipeline comercial</p>
            <h1 className="mt-1 text-xl font-semibold">Editais salvos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Arraste os editais para acompanhar cada etapa da proposta.</p>
          </header>
          <div className="p-4 sm:p-6"><SavedOpportunitiesKanban /></div>
        </main>
        <OpportunityRightPanel />
      </div>
    </div>
  )
}
