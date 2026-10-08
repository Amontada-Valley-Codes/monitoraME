import { NextRequest } from 'next/server';
import { proxyAnalyticsGet } from '../../_proxy';
import { MUNICIPAL_OVERVIEW_PATH } from '@/features/analytics/municipal-overview/api';

export async function GET(request: NextRequest) {
  return proxyAnalyticsGet(request, MUNICIPAL_OVERVIEW_PATH, true, false);
}

