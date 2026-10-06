import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { OpportunityDetails } from '@/features/opportunities/components/opportunity-details';
import { opportunitiesMock } from '@/features/opportunities/mocks';

type OpportunityDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return opportunitiesMock.map(({ id }) => ({ id }));
}

export default function OpportunityDetailsPage({
  params,
}: OpportunityDetailsPageProps) {
  return (
    <Suspense fallback={<OpportunityDetailsFallback />}>
      <OpportunityDetailsContent params={params} />
    </Suspense>
  );
}

async function OpportunityDetailsContent({
  params,
}: OpportunityDetailsPageProps) {
  const { id } = await params;

  const opportunity = opportunitiesMock.find(
    (item) => item.id === id,
  );

  if (!opportunity) {
    notFound();
  }

  return <OpportunityDetails opportunity={opportunity} />;
}

function OpportunityDetailsFallback() {
  return (
    <div className="flex min-h-screen w-full bg-background" aria-busy="true">
      <div className="hidden w-(--sidebar-size) shrink-0 border-r bg-sidebar xl:block" />
      <main className="min-w-0 flex-1 bg-card">
        <div className="h-(--header-height) animate-pulse border-b bg-muted/50" />
        <div className="space-y-4 p-4 sm:p-6">
          <div className="h-72 animate-pulse rounded-xl border bg-muted/50" />
          <div className="h-56 animate-pulse rounded-xl border bg-muted/50" />
        </div>
      </main>
      <aside className="hidden w-80 shrink-0 border-l bg-background lg:block 2xl:w-96" />
    </div>
  );
}
