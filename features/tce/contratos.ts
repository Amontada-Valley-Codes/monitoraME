import { z } from 'zod';

const ROTA_CONTRATOS = '/pipeline/tce/contratos';
const URL_PROXY_PADRAO = 'http://localhost:3000';
const TIMEOUT_PADRAO_MS = 60_000;
const DATA_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CODIGO_MUNICIPIO_PATTERN = /^\d{3}$/;

function normalizarSentinelas(valor: unknown): unknown {
  if (valor === 'nao_informado') return null;
  if (Array.isArray(valor)) return valor.map(normalizarSentinelas);
  if (valor !== null && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor).map(([chave, item]) => [chave, normalizarSentinelas(item)]),
    );
  }
  return valor;
}

const textoAusenteSchema = z.preprocess(
  (valor) => valor === 'nao_informado' ? null : valor,
  z.string().nullable(),
);

const textoAusenteOpcionalSchema = textoAusenteSchema.optional();
const booleanoOpcionalSchema = z.boolean().nullable().optional();

const contratoSchema = z.object({
  codigo_municipio: textoAusenteOpcionalSchema,
  numero_contrato: textoAusenteOpcionalSchema,
  tipo_contrato: textoAusenteOpcionalSchema,
  modalide_contrato: textoAusenteOpcionalSchema,
  numero_contrato_original: textoAusenteOpcionalSchema,
  data_contrato_original: textoAusenteOpcionalSchema,
  numero_id_contrato_pncp: textoAusenteOpcionalSchema,
  data_contrato: textoAusenteOpcionalSchema,
  data_inicio_vigencia_contrato: textoAusenteOpcionalSchema,
  data_fim_vigencia_contrato: textoAusenteOpcionalSchema,
  data_contrato_contratado: textoAusenteOpcionalSchema,
  descricao_objeto_contrato: textoAusenteOpcionalSchema,
  valor_total_contrato: z.number().finite().nullable().optional(),
  numero_processo_adm: textoAusenteOpcionalSchema,
  data_autuacao_processo_adm: textoAusenteOpcionalSchema,
  nome_fiscal_contrato: textoAusenteOpcionalSchema,
  cpf_gestor_valido: booleanoOpcionalSchema,
  cpf_gestor_original_valido: booleanoOpcionalSchema,
  cpf_fiscal_contrato_valido: booleanoOpcionalSchema,
  cpf_gestor_valido_contratado: booleanoOpcionalSchema,
  numero_documento_negociante: textoAusenteOpcionalSchema,
  codigo_tipo_negociante: textoAusenteOpcionalSchema,
  nome_negociante: textoAusenteOpcionalSchema,
  endereco_negociante: textoAusenteOpcionalSchema,
  fone_negociante: textoAusenteOpcionalSchema,
  cep_negociante: textoAusenteOpcionalSchema,
  nome_municipio_negociante: textoAusenteOpcionalSchema,
  codigo_uf: textoAusenteOpcionalSchema,
}).passthrough();

const respostaContratosSchema = z.preprocess(normalizarSentinelas, z.object({
  fonte: z.string(),
  parametros: z.object({
    data_inicial: z.string().optional(),
    data_final: z.string().optional(),
    codigo_municipio: z.string().optional(),
  }).passthrough(),
  totais_brutos: z.object({
    contratos: z.number().finite().nonnegative(),
    contratados: z.number().finite().nonnegative(),
  }).passthrough(),
  totais: z.object({
    contratos: z.number().finite().nonnegative(),
  }).passthrough(),
  // A especificação do proxy ainda não define se este campo é um número ou
  // uma estrutura de paginação. Ele é preservado sem inferir comportamento.
  limite_resposta: z.unknown(),
  dados: z.array(contratoSchema),
}).passthrough());

export type ContratoTce = z.infer<typeof contratoSchema>;
export type RespostaContratosTce = z.infer<typeof respostaContratosSchema>;

export interface ConsultaContratosTce {
  data_inicial: string;
  data_final: string;
  codigo_municipio?: string;
}

export interface OpcoesConsultaContratosTce {
  /** Sobrescreve TCE_PROXY_BASE_URL. Útil em testes e outros ambientes. */
  baseUrl?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  fetch?: typeof fetch;
}

export type CodigoErroContratosTce =
  | 'VALIDACAO'
  | 'TIMEOUT'
  | 'CANCELADO'
  | 'REDE'
  | 'HTTP'
  | 'JSON_INVALIDO'
  | 'RESPOSTA_INVALIDA';

export class ErroContratosTce extends Error {
  constructor(
    message: string,
    public readonly codigo: CodigoErroContratosTce,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ErroContratosTce';
  }
}

function dataValida(valor: string): boolean {
  if (!DATA_PATTERN.test(valor)) return false;

  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return data.getUTCFullYear() === ano
    && data.getUTCMonth() === mes - 1
    && data.getUTCDate() === dia;
}

export function validarConsultaContratosTce(
  parametros: ConsultaContratosTce,
): ConsultaContratosTce {
  if (!dataValida(parametros.data_inicial)) {
    throw new ErroContratosTce(
      'data_inicial deve ser uma data real no formato YYYY-MM-DD.',
      'VALIDACAO',
    );
  }

  if (!dataValida(parametros.data_final)) {
    throw new ErroContratosTce(
      'data_final deve ser uma data real no formato YYYY-MM-DD.',
      'VALIDACAO',
    );
  }

  if (parametros.data_final < parametros.data_inicial) {
    throw new ErroContratosTce(
      'data_final deve ser maior ou igual a data_inicial.',
      'VALIDACAO',
    );
  }

  const codigo = parametros.codigo_municipio;
  if (codigo !== undefined) {
    if (!CODIGO_MUNICIPIO_PATTERN.test(codigo)) {
      throw new ErroContratosTce(
        'codigo_municipio deve conter exatamente 3 dígitos.',
        'VALIDACAO',
      );
    }

    const codigoNumerico = Number(codigo);
    if (codigoNumerico < 1 || codigoNumerico > 185) {
      throw new ErroContratosTce(
        'codigo_municipio deve estar no intervalo de 001 a 185.',
        'VALIDACAO',
      );
    }
  }

  return parametros;
}

function obterBaseUrl(baseUrl?: string): string {
  const configurada = baseUrl ?? process.env.TCE_PROXY_BASE_URL ?? URL_PROXY_PADRAO;

  try {
    const url = new URL(configurada);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
    return url.toString();
  } catch {
    throw new ErroContratosTce(
      'TCE_PROXY_BASE_URL deve ser uma URL HTTP ou HTTPS válida.',
      'VALIDACAO',
    );
  }
}

export function criarUrlConsultaContratosTce(
  parametros: ConsultaContratosTce,
  baseUrl?: string,
): URL {
  validarConsultaContratosTce(parametros);

  const url = new URL(ROTA_CONTRATOS, obterBaseUrl(baseUrl));
  url.searchParams.set('data_inicial', parametros.data_inicial);
  url.searchParams.set('data_final', parametros.data_final);

  if (parametros.codigo_municipio !== undefined) {
    url.searchParams.set('codigo_municipio', parametros.codigo_municipio);
  }

  return url;
}

export async function consultarContratosTce(
  parametros: ConsultaContratosTce,
  opcoes: OpcoesConsultaContratosTce = {},
): Promise<RespostaContratosTce> {
  const url = criarUrlConsultaContratosTce(parametros, opcoes.baseUrl);
  const timeoutMs = opcoes.timeoutMs ?? TIMEOUT_PADRAO_MS;

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new ErroContratosTce('timeoutMs deve ser maior que zero.', 'VALIDACAO');
  }

  const controller = new AbortController();
  const cancelar = () => controller.abort(opcoes.signal?.reason);
  opcoes.signal?.addEventListener('abort', cancelar, { once: true });
  if (opcoes.signal?.aborted) cancelar();

  const timer = setTimeout(
    () => controller.abort(new DOMException('Tempo limite excedido.', 'TimeoutError')),
    timeoutMs,
  );

  try {
    let resposta: Response;
    try {
      resposta = await (opcoes.fetch ?? globalThis.fetch)(url, {
        method: 'GET',
        headers: { accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (erro) {
      if (opcoes.signal?.aborted) {
        throw new ErroContratosTce('Consulta cancelada.', 'CANCELADO', undefined, { cause: erro });
      }
      if (controller.signal.aborted) {
        throw new ErroContratosTce(
          `O proxy não respondeu em até ${timeoutMs} ms.`,
          'TIMEOUT',
          undefined,
          { cause: erro },
        );
      }
      throw new ErroContratosTce(
        'Não foi possível conectar ao proxy de contratos.',
        'REDE',
        undefined,
        { cause: erro },
      );
    }

    if (!resposta.ok) {
      throw new ErroContratosTce(
        `O proxy respondeu com HTTP ${resposta.status}.`,
        'HTTP',
        resposta.status,
      );
    }

    let corpo: unknown;
    try {
      corpo = await resposta.json();
    } catch (erro) {
      if (opcoes.signal?.aborted) {
        throw new ErroContratosTce('Consulta cancelada.', 'CANCELADO', undefined, { cause: erro });
      }
      if (controller.signal.aborted) {
        throw new ErroContratosTce(
          `O proxy não respondeu em até ${timeoutMs} ms.`,
          'TIMEOUT',
          undefined,
          { cause: erro },
        );
      }
      throw new ErroContratosTce(
        'O proxy retornou JSON inválido.',
        'JSON_INVALIDO',
        resposta.status,
        { cause: erro },
      );
    }

    const resultado = respostaContratosSchema.safeParse(corpo);
    if (!resultado.success) {
      const detalhes = resultado.error.issues
        .map((issue) => `${issue.path.join('.') || 'resposta'}: ${issue.message}`)
        .join('; ');
      throw new ErroContratosTce(
        `A resposta do proxy não corresponde ao contrato esperado: ${detalhes}`,
        'RESPOSTA_INVALIDA',
        resposta.status,
        { cause: resultado.error },
      );
    }

    return resultado.data;
  } finally {
    clearTimeout(timer);
    opcoes.signal?.removeEventListener('abort', cancelar);
  }
}
