import type { PipelineOverviewParams } from './types';
import { PipelineOverviewError } from './types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MUNICIPALITY_PATTERN = /^\d{3}$/;

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function validateOverviewParams(
  params: PipelineOverviewParams,
): PipelineOverviewParams {
  if (!isRealDate(params.data_inicial) || !isRealDate(params.data_final)) {
    throw new PipelineOverviewError(
      'As datas devem ser reais e usar o formato YYYY-MM-DD.',
      'VALIDATION',
      400,
    );
  }

  const startYear = params.data_inicial.slice(0, 4);
  if (
    params.data_inicial !== `${startYear}-01-01`
    || params.data_final !== `${startYear}-12-31`
  ) {
    throw new PipelineOverviewError(
      'A consulta deve abranger um exercício completo, de 01/01 a 31/12.',
      'VALIDATION',
      400,
    );
  }

  if (
    params.codigo_municipio !== undefined
    && !MUNICIPALITY_PATTERN.test(params.codigo_municipio)
  ) {
    throw new PipelineOverviewError(
      'codigo_municipio deve conter exatamente três dígitos.',
      'VALIDATION',
      400,
    );
  }

  return params;
}
