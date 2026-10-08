import 'server-only';

import { pipelineApi, PipelineApiError } from '@/lib/http/pipeline-api';

import {
  pipelineOverviewSchema,
  PipelineOverviewError,
  type PipelineOverviewParams,
  type PipelineTceOverview,
} from './types';
import { validateOverviewParams } from './validation';

/** Calls the pipeline once and validates its JSON; this layer does not cache. */
export async function fetchPipelineOverview(
  input: PipelineOverviewParams,
): Promise<PipelineTceOverview> {
  const params = validateOverviewParams(input);

  try {
    const response = await pipelineApi.get<unknown>('/pipeline/tce/overview', {
      params,
    });
    const parsed = pipelineOverviewSchema.safeParse(response.data);
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'response'}: ${issue.message}`)
        .join('; ');
      throw new PipelineOverviewError(
        `Os dados recebidos não puderam ser processados: ${details}`,
        'INVALID_RESPONSE',
        502,
        { cause: parsed.error },
      );
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof PipelineOverviewError) throw error;
    if (error instanceof PipelineApiError) {
      const code = error.kind === 'timeout'
        ? 'TIMEOUT'
        : error.kind === 'network'
          ? 'NETWORK'
          : 'HTTP';
      throw new PipelineOverviewError(error.message, code, error.status, {
        cause: error,
      });
    }
    throw error;
  }
}
