import { NextRequest } from 'next/server';
import { proxyAnalyticsGet } from '../_proxy';

export function GET(request: NextRequest) {
  return proxyAnalyticsGet(request, '/analytics/tce/fornecedores', true);
}
