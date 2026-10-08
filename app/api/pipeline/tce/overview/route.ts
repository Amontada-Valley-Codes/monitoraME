import { NextRequest, NextResponse } from 'next/server';

import { getPipelineOverview, PIPELINE_CACHE_SECONDS } from '@/features/analytics/pipeline/cache';
import { getPipelineOverviewError } from '@/features/analytics/pipeline/types';
import { validateOverviewParams } from '@/features/analytics/pipeline/validation';

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams;
    const params = validateOverviewParams({
      data_inicial: search.get('data_inicial') ?? '',
      data_final: search.get('data_final') ?? '',
    });
    const data = await getPipelineOverview(
      params.data_inicial,
      params.data_final,
    );
    const partial = data.competencias_ausentes.length > 0
      || data.falhas_competencias.length > 0;
    const current = Number(params.data_inicial.slice(0, 4)) === new Date().getFullYear();
    const staleTime = partial
      ? PIPELINE_CACHE_SECONDS.partial
      : current
        ? PIPELINE_CACHE_SECONDS.current
        : PIPELINE_CACHE_SECONDS.closed;

    return NextResponse.json(data, {
      headers: { 'x-pipeline-stale-time': String(staleTime) },
    });
  } catch (error) {
    const pipelineError = getPipelineOverviewError(error);
    if (pipelineError) {
      const status = pipelineError.status
        ?? (pipelineError.code === 'TIMEOUT' ? 504 : 503);
      return NextResponse.json(
        { error: { code: pipelineError.code, message: pipelineError.message } },
        { status },
      );
    }
    return NextResponse.json(
      { error: { code: 'UNKNOWN', message: 'Não foi possível carregar os dados solicitados.' } },
      { status: 500 },
    );
  }
}
