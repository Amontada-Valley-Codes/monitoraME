import { NextRequest } from 'next/server';
import { proxyAnalyticsPost } from '../_proxy';

export async function POST(request: NextRequest) {
  return proxyAnalyticsPost('/analytics/tce/comparisons', await request.json());
}
