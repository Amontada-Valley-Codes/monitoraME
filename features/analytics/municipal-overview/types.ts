export interface MunicipalOverview {
  fonte?: string;
  origem_dados?: string;
  consultas_externas?: boolean;
  status_exercicio?: string;
  municipio?: { nome?: string; uf?: string; codigo_ibge?: string; codigo_tce?: string };
  competencias_solicitadas?: string[];
  competencias_publicadas?: string[];
  competencias_ausentes?: string[];
  falhas_competencias?: unknown[];
  totais_brutos?: { empenhos?: number };
  totais_filtrados?: { empenhos?: number };
  cobertura_cadastral?: { empenhos?: number; empenhos_com_cache?: number; percentual?: number };
  unidade_monetaria?: string;
  kpis?: {
    percentual_participacao_me?: number;
    total_compras_ME_centavos?: number;
    percentual_compras_fornecedores_locais?: number;
    percentual_recursos_fora_municipio?: number;
  };
  participacao_por_porte_empresarial?: Array<{ porte?: string; valor_centavos?: number; percentual?: number }>;
  elementos_despesa?: Array<{ codigo?: string; nome?: string; valor_liquido_centavos?: number }>;
  evolucao_compras_consideradas?: Array<{ periodo?: string; compras_consideradas_centavos?: number; microempresas_centavos?: number }>;
  destino_recursos?: Array<{ destino?: string; valor_centavos?: number; percentual?: number }>;
}

export type MunicipalOverviewInput = { start_date: string; end_date: string; municipality_tce_code: string };
export type MunicipalOverviewApiParams = { data_inicial: string; data_final: string; codigo_municipio: string };

