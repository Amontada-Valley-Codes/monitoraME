import { Suspense } from 'react';

import SavedOpportunitiesWorkspace from '@/features/opportunities/saved-opportunities-workspace';

type SavedOpportunitiesPageProps = {
  searchParams: Promise<{ visualizacao?: string | string[] }>;
};

export default function SavedOpportunitiesPage(props: SavedOpportunitiesPageProps) {
  return (
    <Suspense fallback={<SavedOpportunitiesLoading />}>
      <SavedOpportunitiesContent {...props} />
    </Suspense>
  );
}

async function SavedOpportunitiesContent({ searchParams }: SavedOpportunitiesPageProps) {
  const params = await searchParams;
  const requestedView = Array.isArray(params.visualizacao) ? params.visualizacao[0] : params.visualizacao;
  const initialView = requestedView === 'agenda' || requestedView === 'kanban' ? requestedView : 'calendar';

  return <main className="min-h-[calc(100svh-var(--header-height))] bg-muted/20"><div className="p-4 sm:p-6"><SavedOpportunitiesWorkspace initialView={initialView} /></div></main>;
}

function SavedOpportunitiesLoading() {
  return (
    <main className="min-h-[calc(100svh-var(--header-height))] bg-muted/20">
      <div className="p-4 sm:p-6">
        <div className="h-[38rem] animate-pulse rounded-xl bg-muted" />
      </div>
    </main>
  );
}
