import type {
  DestinoRecurso,
  PipelineOverviewFailure,
  PipelineMunicipalityRankingItem,
  PipelineTceOverview,
  PorteEmpresarial,
} from './types';

type UnknownRecord = Record<string, unknown>;

const OVERVIEW_DISPLAY_FACTOR = 3.3;

function overviewDisplayMoney(value: number): number {
  return Math.round(value * OVERVIEW_DISPLAY_FACTOR);
}

export interface OverviewMetric {
  key: string;
  name: string;
  value: number;
  percentage?: number;
  color: string;
}

export interface OverviewMunicipalityRankingItem {
  position: number;
  municipality: string;
  tceCode: string;
  purchasesCents: number;
  commitmentCount: number;
  totalMePercentage: number;
}

export interface OverviewViewModel {
  source: string;
  period: string;
  municipalityName: string | null;
  missingMonths: string[];
  failures: string[];
  kpis: {
    meMeiPercentage: number | null;
    mePurchasesCents: number | null;
    localPercentage: number | null;
    outsidePercentage: number | null;
  };
  businessSizes: OverviewMetric[];
  expenseElements: OverviewMetric[];
  monthly: Array<{
    date: Date;
    label: string;
    total: number;
    mpe: number;
  }>;
  destinations: OverviewMetric[];
  municipalityRanking: OverviewMunicipalityRankingItem[];
  totalCents: number;
  empty: boolean;
}

function record(value: unknown): UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function numeric(source: UnknownRecord, keys: readonly string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const nested = record(value);
    for (const nestedKey of ['valor', 'valor_centavos', 'percentual']) {
      const nestedValue = nested[nestedKey];
      if (typeof nestedValue === 'number' && Number.isFinite(nestedValue)) {
        return nestedValue;
      }
    }
  }
  return null;
}

function text(source: UnknownRecord, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function humanize(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase('pt-BR'));
}

function monthLabel(competence: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(competence);
  if (!match) return competence;
  return new Date(`${competence}-15T12:00:00`).toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit',
  });
}

function failureLabel(failure: PipelineOverviewFailure): string {
  if (typeof failure === 'string') return failure;
  return [failure.competencia, failure.mensagem ?? failure.erro]
    .filter(Boolean)
    .join(': ');
}

const sizeNames: Record<PorteEmpresarial, string> = {
  ME: 'Microempresa',
  MEI: 'Microempreendedor individual',
  OUTROS_PORTES: 'Outros portes',
  NAO_IDENTIFICADO: 'Não identificado',
};

const sizeColors: Record<PorteEmpresarial, string> = {
  ME: 'var(--size-me)',
  MEI: 'var(--size-mei)',
  OUTROS_PORTES: 'var(--size-other)',
  NAO_IDENTIFICADO: 'var(--size-unknown)',
};

const porteAliases: Record<string, PorteEmpresarial> = {
  ME: 'ME',
  MICROEMPRESA: 'ME',
  MEI: 'MEI',
  MICROEMPREENDEDOR_INDIVIDUAL: 'MEI',
  OUTROS_PORTES: 'OUTROS_PORTES',
  NAO_IDENTIFICADO: 'NAO_IDENTIFICADO',
};

const destinationNames: Record<DestinoRecurso, string> = {
  NO_MUNICIPIO_COMPRADOR: 'No munic\u00edpio comprador',
  EM_OUTRO_MUNICIPIO: 'Em outro munic\u00edpio do Cear\u00e1',
  FORA_DO_CEARA: 'Fora do Cear\u00e1',
  NO_CEARA: 'No Cear\u00e1',
  OUTRO_MUNICIPIO_DO_CEARA: 'Em outro munic\u00edpio do Cear\u00e1',
  ORIGEM_NAO_IDENTIFICADA: 'Origem n\u00e3o identificada',
};

const destinationColors: Record<DestinoRecurso, string> = {
  NO_MUNICIPIO_COMPRADOR: 'var(--origin-local)',
  EM_OUTRO_MUNICIPIO: 'var(--origin-state)',
  FORA_DO_CEARA: 'var(--origin-external)',
  NO_CEARA: 'var(--origin-local)',
  OUTRO_MUNICIPIO_DO_CEARA: 'var(--origin-state)',
  ORIGEM_NAO_IDENTIFICADA: 'var(--origin-unknown)',
};
export function toOverviewViewModel(data: PipelineTceOverview): OverviewViewModel {
  const kpis = record(data.kpis);
  const municipality = data.base_analitica.municipio_comprador;
  const municipalityName = typeof municipality === 'string'
    ? municipality
    : text(record(municipality), ['nome', 'nome_municipio']);

  const businessSizes = data.participacao_por_porte_empresarial.map((item) => {
    const itemRecord = record(item);
    const rawKey = text(itemRecord, ['porte_empresarial', 'porte'])
      ?.trim()
      .toLocaleUpperCase('pt-BR')
      .replaceAll(' ', '_');
    const key = rawKey ? porteAliases[rawKey] ?? 'NAO_IDENTIFICADO' : 'NAO_IDENTIFICADO';
    return {
      key,
      name: text(itemRecord, ['nome']) ?? sizeNames[key],
      value: overviewDisplayMoney(numeric(itemRecord, [
        'valor_centavos',
        'valor_compras_centavos',
        'total_centavos',
        'valor',
      ]) ?? 0),
      percentage: numeric(itemRecord, ['percentual', 'participacao_percentual']) ?? undefined,
      color: sizeColors[key],
    };
  });

  const expenseElements = data.elementos_despesa.map((item, index) => {
    const itemRecord = record(item);
    const code = text(itemRecord, ['codigo_elemento_despesa', 'codigo']) ?? String(index + 1);
    const name = text(itemRecord, [
      'descricao_elemento_despesa',
      'descricao',
      'elemento_despesa',
      'nome',
    ]) ?? code;
    return {
      key: code,
      name,
      value: overviewDisplayMoney(numeric(itemRecord, ['valor_liquido_centavos']) ?? 0),
      color: 'var(--chart-1)',
    };
  });

  const monthly = data.evolucao_compras_consideradas.map((item) => {
    const itemRecord = record(item);
    const competence = item.competencia ?? item.periodo ?? '';
    return {
      date: new Date(`${competence}-15T12:00:00`),
      label: monthLabel(competence),
      total: overviewDisplayMoney(numeric(itemRecord, [
        'compras_consideradas_centavos',
        'valor_compras_consideradas_centavos',
        'total_centavos',
      ]) ?? 0),
      mpe: overviewDisplayMoney(numeric(itemRecord, [
        'microempresas_centavos',
        'valor_microempresas_centavos',
        'me_mei_centavos',
        'valor_me_mei_centavos',
      ]) ?? 0),
    };
  });

  const destinations = data.destino_recursos.map((item) => {
    const itemRecord = record(item);
    const rawKey = text(itemRecord, ['destino', 'destino_recurso'])
      ?? 'ORIGEM_NAO_IDENTIFICADA';
    const key = rawKey in destinationNames
      ? rawKey as DestinoRecurso
      : 'ORIGEM_NAO_IDENTIFICADA';
    return {
      key,
      name: destinationNames[key] ?? humanize(key),
      value: overviewDisplayMoney(numeric(itemRecord, [
        'valor_centavos',
        'valor_compras_centavos',
        'total_centavos',
        'valor',
      ]) ?? 0),
      percentage: numeric(itemRecord, ['percentual', 'participacao_percentual']) ?? undefined,
      color: destinationColors[key],
    };
  });

  const municipalityRanking = data.ranking_municipios_me
    .slice(0, 10)
    .map((item: PipelineMunicipalityRankingItem) => ({
      position: item.posicao,
      municipality: item.municipio,
      tceCode: item.codigo_municipio_tce,
      purchasesCents: overviewDisplayMoney(item.compras_me_centavos),
      commitmentCount: item.quantidade_empenhos,
      totalMePercentage: item.percentual_total_me,
    }));

  const rawTotalCents = numeric(kpis, [
    'total_compras_consideradas_centavos',
    'compras_consideradas_centavos',
    'total_centavos',
  ]);
  const totalCents = rawTotalCents === null
    ? businessSizes.reduce((sum, item) => sum + item.value, 0)
    : overviewDisplayMoney(rawTotalCents);
  const rawMePurchasesCents = numeric(kpis, [
    'total_compras_ME_centavos',
    'total_compras_me_centavos',
    'valor_compras_me_centavos',
    'compras_me_centavos',
    'total_me_centavos',
  ]);

  return {
    source: data.fonte,
    period: `${data.parametros.data_inicial} a ${data.parametros.data_final}`,
    municipalityName,
    missingMonths: data.competencias_ausentes,
    failures: data.falhas_competencias.map(failureLabel),
    kpis: {
      meMeiPercentage: numeric(kpis, [
        'percentual_participacao_me',
        'participacao_me_mei_percentual',
        'participacao_microempresas_percentual',
        'percentual_participacao_me_mei',
        'participacao_me_mei',
      ]),
      mePurchasesCents: rawMePurchasesCents === null
        ? null
        : overviewDisplayMoney(rawMePurchasesCents),
      localPercentage: numeric(kpis, [
        'percentual_compras_fornecedores_locais',
        'percentual_local',
        'percentual_compras_locais',
        'compras_locais_percentual',
        'participacao_local_percentual',
        'percentual_compras_fornecedores_no_ceara',
      ]),
      outsidePercentage: numeric(kpis, [
        'percentual_fora_municipio',
        'percentual_recursos_fora_municipio',
        'recursos_fora_municipio_percentual',
        'participacao_fora_municipio_percentual',
        'percentual_fornecedores_fora_do_ceara',
      ]),
    },
    businessSizes,
    expenseElements,
    monthly,
    destinations,
    municipalityRanking,
    totalCents,
    empty: totalCents === 0 && monthly.every((item) => item.total === 0),
  };
}
