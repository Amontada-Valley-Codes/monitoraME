export type Size = 'ME' | 'MEI' | 'DEMAIS' | 'NI';
export type Origin = 'LOCAL' | 'ESTADO' | 'FORA' | 'NI';

export type Filters = {
  uf: string;
  municipality: string;
  start: string;
  end: string;
  size: string;
  origin: string;
  categories: string[];
};

export type Municipality = {
  id: string;
  name: string;
  uf: string;
  region: string;
  population: number;
  monthly: number;
};

export type Supplier = {
  id: string;
  name: string;
  cnpj: string;
  size: Size;
  city: string;
  ibge: string;
  uf: string;
  status: 'Ativa' | 'Baixada' | 'Não identificada';
  nature: string;
};

export type Expense = {
  id: string;
  date: string;
  municipality: string;
  supplier: string;
  size: Size;
  origin: Origin;
  category: string;
  gross: number;
  cancelled: number;
  net: number;
  description: string;
  provenance: 'HISTORICO' | 'RETRATO_ATUAL';
  meiDiscriminated: boolean;
};

export type Aggregate = {
  total: number;
  mpe: number;
  mei: number;
  me: number;
  local: number;
  external: number;
  unknown: number;
  mpeLocal: number;
  suppliers: number;
  count: number;
  bySize: { name: string; key: Size; value: number; color: string }[];
  byOrigin: { name: string; key: Origin; value: number; color: string }[];
  byCategory: { name: string; key: string; value: number }[];
  monthly: {
    date: Date;
    label: string;
    total: number;
    mpe: number;
    local: number;
  }[];
};

export type Goal = {
  id: string;
  municipality: string;
  year: string;
  indicator: 'mpe' | 'local' | 'mpeLocal';
  target: number;
  notes: string;
  archived: boolean;
};

export type SavedReport = {
  id: string;
  name: string;
  description: string;
  filters: Filters;
  group: 'municipios' | 'despesas' | 'fornecedores';
  createdAt: string;
  archived: boolean;
};

export type LoadState = 'loading' | 'ready' | 'error';