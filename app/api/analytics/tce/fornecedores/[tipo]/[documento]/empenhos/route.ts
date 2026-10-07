import { NextRequest } from 'next/server';
import { proxyAnalyticsGet } from '../../../../_proxy';

export async function GET(
  request: NextRequest,
  context: RouteContext<'/api/analytics/tce/fornecedores/[tipo]/[documento]/empenhos'>,
) {
  const { tipo, documento } = await context.params;
  const path = `/analytics/tce/fornecedores/${encodeURIComponent(tipo)}/${encodeURIComponent(documento)}/empenhos`;
  return proxyAnalyticsGet(request, path, true);
}
