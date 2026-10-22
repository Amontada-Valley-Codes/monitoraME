import { z } from 'zod';

export type PorteEmpresarial =
  | 'ME'
  | 'MEI'
  | 'OUTROS_PORTES'
  | 'NAO_IDENTIFICADO';

export type PorteEscopo = 'ME' | 'MEI' | 'EPP' | 'DEMAIS';

export type DestinoRecurso =
  | 'NO_MUNICIPIO_COMPRADOR'
  | 'EM_OUTRO_MUNICIPIO'
  | 'FORA_DO_CEARA'
  | 'NO_CEARA'
  | 'OUTRO_MUNICIPIO_DO_CEARA'
  | 'ORIGEM_NAO_IDENTIFICADA';

export interface PipelineOverviewParams {
  data_inicial: string;
  data_final: string;
  codigo_municipio?: string;
}

const metricSchema = z.object({
  valor_centavos: z.number().finite().optional(),
  percentual: z.number().finite().optional(),
}).passthrough();

const failureSchema = z.union([
  z.string(),
  z.object({
    competencia: z.string().optional(),
    erro: z.string().optional(),
    mensagem: z.string().optional(),
  }).passthrough(),
]);

const businessSizeSchema = metricSchema.extend({
  porte_empresarial: z.enum([
    'ME',
    'MEI',
    'OUTROS_PORTES',
    'NAO_IDENTIFICADO',
  ]).optional(),
  porte: z.string().optional(),
  nome: z.string().optional(),
});

const expenseElementSchema = z.object({
  codigo: z.string().optional(),
  codigo_elemento_despesa: z.string().optional(),
  nome: z.string().optional(),
  descricao: z.string().optional(),
  descricao_elemento_despesa: z.string().optional(),
  elemento_despesa: z.string().optional(),
  valor_liquido_centavos: z.number().finite().optional(),
}).passthrough();

const monthlyEvolutionSchema = z.object({
  competencia: z.string().optional(),
  periodo: z.string().optional(),
  compras_consideradas_centavos: z.number().finite().optional(),
  microempresas_centavos: z.number().finite().optional(),
}).passthrough().refine(
  (value) => value.competencia !== undefined || value.periodo !== undefined,
  { message: 'competencia ou periodo é obrigatório' },
);

const resourceDestinationSchema = metricSchema.extend({
  destino: z.enum([
    'NO_MUNICIPIO_COMPRADOR',
    'EM_OUTRO_MUNICIPIO',
    'FORA_DO_CEARA',
    'NO_CEARA',
    'OUTRO_MUNICIPIO_DO_CEARA',
    'ORIGEM_NAO_IDENTIFICADA',
  ]).optional(),
  destino_recurso: z.string().optional(),
});

const overviewKpisSchema = z.object({
  percentual_participacao_me: z.number().finite().optional(),
  total_compras_ME_centavos: z.number().finite().optional(),
  percentual_compras_fornecedores_locais: z.number().finite().optional(),
  percentual_recursos_fora_municipio: z.number().finite().optional(),
  percentual_compras_fornecedores_no_ceara: z.number().finite().optional(),
  percentual_fornecedores_fora_do_ceara: z.number().finite().optional(),
}).passthrough();

const municipalityRankingSchema = z.object({
  posicao: z.number().int().positive(),
  codigo_municipio_tce: z.string(),
  municipio: z.string(),
  compras_me_centavos: z.number().finite(),
  quantidade_empenhos: z.number().int().nonnegative(),
  percentual_total_me: z.number().finite(),
}).passthrough();

export const pipelineOverviewSchema = z.object({
  fonte: z.string(),
  parametros: z.object({
    data_inicial: z.string(),
    data_final: z.string(),
    codigo_municipio: z.string().nullish(),
  }).passthrough(),
  competencias_solicitadas: z.array(z.string()).default([]),
  competencias_encontradas: z.array(z.string()).default([]),
  competencias_publicadas: z.array(z.string()).default([]),
  competencias_atualizadas: z.array(z.string()).default([]),
  competencias_reutilizadas: z.array(z.string()).default([]),
  competencias_desatualizadas: z.array(z.string()).default([]),
  competencias_ausentes: z.array(z.string()).default([]),
  falhas_competencias: z.array(failureSchema).default([]),
  totais_brutos: z.record(z.string(), z.unknown()).default({}),
  base_analitica: z.object({
    municipio_comprador: z.union([
      z.string(),
      z.object({
        codigo: z.string().optional(),
        nome: z.string().optional(),
      }).passthrough(),
    ]).nullish(),
  }).passthrough(),
  kpi: z.string(),
  escopo: z.record(z.string(), z.unknown()).default({}),
  unidade_monetaria: z.literal('CENTAVOS'),
  kpis: overviewKpisSchema,
  participacao_por_porte_empresarial: z.array(businessSizeSchema),
  elementos_despesa: z.array(expenseElementSchema),
  evolucao_compras_consideradas: z.array(monthlyEvolutionSchema),
  destino_recursos: z.array(resourceDestinationSchema),
  ranking_municipios_me: z.array(municipalityRankingSchema).default([]),
}).passthrough();

export type PipelineOverviewFailure = z.infer<typeof failureSchema>;
export type PipelineBusinessSize = z.infer<typeof businessSizeSchema>;
export type PipelineExpenseElement = z.infer<typeof expenseElementSchema>;
export type PipelineMonthlyEvolution = z.infer<typeof monthlyEvolutionSchema>;
export type PipelineResourceDestination = z.infer<typeof resourceDestinationSchema>;
export type PipelineMunicipalityRankingItem = z.infer<typeof municipalityRankingSchema>;
export type PipelineTceOverview = z.infer<typeof pipelineOverviewSchema>;

export type PipelineOverviewErrorCode =
  | 'VALIDATION'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'HTTP'
  | 'INVALID_RESPONSE';

export class PipelineOverviewError extends Error {
  constructor(
    message: string,
    public readonly code: PipelineOverviewErrorCode,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = `PipelineOverviewError:${code}:${status ?? ''}`;
  }
}

const pipelineOverviewErrorCodes = new Set<PipelineOverviewErrorCode>([
  'VALIDATION',
  'TIMEOUT',
  'NETWORK',
  'HTTP',
  'INVALID_RESPONSE',
]);

export interface PipelineOverviewErrorDetails {
  message: string;
  code: PipelineOverviewErrorCode;
  status?: number;
}

/** Cache boundaries preserve Error.name/message, but not custom prototypes/properties. */
export function getPipelineOverviewError(
  error: unknown,
): PipelineOverviewErrorDetails | null {
  if (error === null || typeof error !== 'object') return null;
  const candidate = error as Record<string, unknown>;
  if (typeof candidate.message !== 'string') return null;

  if (
    typeof candidate.code === 'string'
    && pipelineOverviewErrorCodes.has(candidate.code as PipelineOverviewErrorCode)
  ) {
    return {
      message: candidate.message,
      code: candidate.code as PipelineOverviewErrorCode,
      ...(typeof candidate.status === 'number' ? { status: candidate.status } : {}),
    };
  }

  const encoded = typeof candidate.name === 'string'
    ? /^PipelineOverviewError:([A-Z_]+):(\d*)$/.exec(candidate.name)
    : null;
  if (!encoded || !pipelineOverviewErrorCodes.has(encoded[1] as PipelineOverviewErrorCode)) {
    return null;
  }
  return {
    message: candidate.message,
    code: encoded[1] as PipelineOverviewErrorCode,
    ...(encoded[2] ? { status: Number(encoded[2]) } : {}),
  };
}
