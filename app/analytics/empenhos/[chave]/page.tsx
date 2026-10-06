import { Suspense } from 'react';

import { CommitmentDetailShell } from '@/features/analytics/commitments/detail-shell';
import { safeCommitmentListPath, safeDecodeCommitmentKey } from '@/features/analytics/commitments/navigation';

type DetailProps = {
  params: Promise<{ chave: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
};

export default function CommitmentDetailPage(props: DetailProps) {
  return (
    <Suspense fallback={<main className="page-content"><div className="panel h-48 animate-pulse" /></main>}>
      <DetailContent {...props} />
    </Suspense>
  );
}

async function DetailContent({ params, searchParams }: DetailProps) {
  const [{ chave: routeKey }, query] = await Promise.all([params, searchParams]);
  const chave = safeDecodeCommitmentKey(routeKey);
  const rawFrom = Array.isArray(query.from) ? query.from[0] : query.from;
  return <CommitmentDetailShell commitmentKey={chave} from={safeCommitmentListPath(rawFrom)} />;
}
