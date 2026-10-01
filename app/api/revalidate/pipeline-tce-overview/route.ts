import { timingSafeEqual } from 'node:crypto';

import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import {
  overviewCacheTag,
  PIPELINE_OVERVIEW_TAG,
} from '@/features/analytics/pipeline/cache';
import { validateOverviewParams } from '@/features/analytics/pipeline/validation';
import { PipelineOverviewError } from '@/features/analytics/pipeline/types';

function secretsMatch(received: string, expected: string): boolean {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const expected = process.env.PIPELINE_REVALIDATE_SECRET;
  const received = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!expected || !secretsMatch(received, expected)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    if (body === null || typeof body !== 'object') {
      throw new PipelineOverviewError('Corpo inválido.', 'VALIDATION', 400);
    }
    const values = body as Record<string, unknown>;
    const year = String(values.ano ?? '');
    const municipality = values.codigo_municipio;

    if (!/^\d{4}$/.test(year)) {
      revalidateTag(PIPELINE_OVERVIEW_TAG, { expire: 0 });
      return NextResponse.json({ revalidated: [PIPELINE_OVERVIEW_TAG] });
    }

    const params = validateOverviewParams({
      data_inicial: `${year}-01-01`,
      data_final: `${year}-12-31`,
      ...(municipality === undefined
        ? {}
        : { codigo_municipio: String(municipality) }),
    });
    const tag = overviewCacheTag(params);
    revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ revalidated: [tag] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Corpo inválido.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
