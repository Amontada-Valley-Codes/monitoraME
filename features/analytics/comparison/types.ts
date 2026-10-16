export type CompanySize = 'ME' | 'MEI' | 'EPP' | 'OTHER' | 'UNKNOWN';
export type SupplierOrigin = 'NO_MUNICIPIO_COMPRADOR' | 'EM_OUTRO_MUNICIPIO' | 'FORA_DO_CEARA' | 'ORIGEM_NAO_IDENTIFICADA';
export type ExpenseElementCode = '30' | '32' | '35' | '39' | '40' | '51' | '52';
export type ComparisonMode = 'PERIODS' | 'MUNICIPALITIES' | 'MIXED';
export type Ordering = 'LEFT_HIGHER' | 'RIGHT_HIGHER' | 'TIE' | 'UNAVAILABLE';
export type Unit = 'CENTAVOS' | 'PONTOS_PERCENTUAIS';

export interface ComparisonSideRequest {
  label: string;
  filters: {
    uf: 'CE';
    municipality_ibge_code: string;
    start_date: string;
    end_date: string;
    company_sizes: CompanySize[];
    supplier_origins: SupplierOrigin[];
    expense_element_codes: ExpenseElementCode[];
  };
}

export interface ComparisonRequest {
  comparison_mode: ComparisonMode;
  left: ComparisonSideRequest;
  right: ComparisonSideRequest;
}

export type ComparisonSideDraft = ComparisonSideRequest;

export interface Side { source: 'LEFT' | 'RIGHT'; label: string; value: number | null }
export interface ValueComparison {
  ordering: Ordering;
  left: Side;
  right: Side;
  higher: Side | null;
  lower: Side | null;
  absolute_difference: number | null;
  unit: Unit;
}

export interface SideResult {
  label: string;
  filters: ComparisonSideRequest['filters'];
  overview: {
    status_exercicio?: string | null;
    municipio?: { nome?: string; uf?: string; codigo_ibge?: string; codigo_tce?: string } | null;
    competencias_solicitadas: string[];
    competencias_publicadas: string[];
    competencias_ausentes: string[];
    falhas_competencias: unknown[];
    totais_brutos: { empenhos: number };
    totais_filtrados?: { empenhos: number } | null;
    cobertura_cadastral?: {
      empenhos: number;
      empenhos_com_cache: number;
      percentual: number;
    } | null;
    base_analitica?: { municipio_comprador?: string | null } | null;
    kpis: Record<string, number>;
  };
}

export interface ComparisonResponse {
  fonte: string;
  origem_dados: string;
  consultas_externas: boolean;
  comparison_mode: string;
  left: SideResult;
  right: SideResult;
  sections: {
    kpis: Array<{ indicator: string } & ValueComparison>;
    participacao_por_porte_empresarial: Array<{ porte: string; valor_centavos: ValueComparison; percentual: ValueComparison }>;
    elementos_despesa: Array<{ codigo: string; nome: string } & ValueComparison>;
    evolucao_compras_consideradas: Array<{
      position: number;
      left_period: string | null;
      right_period: string | null;
      left_published: boolean;
      right_published: boolean;
      compras_consideradas_centavos: ValueComparison;
      microempresas_centavos: ValueComparison;
    }>;
    destino_recursos: Array<{ destino: string; valor_centavos: ValueComparison; percentual: ValueComparison }>;
  };
}

