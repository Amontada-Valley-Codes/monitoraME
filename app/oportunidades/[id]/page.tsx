import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { OpportunityDetails } from '@/features/opportunities/components/opportunity-details';
import { opportunitiesMock } from '@/features/opportunities/mocks';

type OpportunityDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};
export default function OpportunityDetailsPage(props: OpportunityDetailsPageProps) {
  return <Suspense fallback={null}><OpportunityDetailsContent {...props} /></Suspense>;
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
