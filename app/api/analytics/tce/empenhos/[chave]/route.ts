import { NextRequest } from 'next/server';
import { safeDecodeCommitmentKey } from '@/features/analytics/commitments/navigation';
import { proxyAnalyticsGet } from '../../_proxy';

export async function GET(request: NextRequest, { params }: { params: Promise<{ chave: string }> }) {
  const { chave: routeKey } = await params;
  const chave = safeDecodeCommitmentKey(routeKey);
  return proxyAnalyticsGet(request, `/analytics/tce/empenhos/${encodeURIComponent(chave)}`, false);
}
