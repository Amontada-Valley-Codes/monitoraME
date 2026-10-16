import { OpportunitySidebar } from '@/features/opportunities/components/opportunity-sidebar';
import { NotificationBell } from '@/features/opportunities/components/notification-bell';
import SavedOpportunitiesWorkspace from '@/features/opportunities/saved-opportunities-workspace';

export default function SavedOpportunitiesPage() {
  return <div className="min-h-screen bg-background"><div className="flex min-h-screen w-full"><OpportunitySidebar active="saved" /><main className="min-w-0 flex-1 bg-muted/20"><header className="flex items-start gap-4 border-b bg-card px-4 py-5 sm:px-6"><div className="min-w-0 flex-1"><h1 className="mt-1 text-xl font-semibold">Editais salvos</h1><p className="mt-1 text-sm text-muted-foreground">Acompanhe prazos, sessões e o andamento das propostas.</p></div><NotificationBell /></header><div className="p-4 sm:p-6"><SavedOpportunitiesWorkspace /></div></main></div></div>;
}
