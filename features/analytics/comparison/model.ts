import type { ComparisonMode, ComparisonRequest, ComparisonSideDraft, ValueComparison } from './types';

export function deriveComparisonMode(left: ComparisonSideDraft, right: ComparisonSideDraft): ComparisonMode | null {
  const sameMunicipality = left.filters.municipality_ibge_code === right.filters.municipality_ibge_code;
  const samePeriod = left.filters.start_date === right.filters.start_date && left.filters.end_date === right.filters.end_date;
  if (sameMunicipality && samePeriod) return null;
  if (sameMunicipality) return 'PERIODS';
  if (samePeriod) return 'MUNICIPALITIES';
  return 'MIXED';
}

function cleanSide(side: ComparisonSideDraft) {
  return {
    label: side.label.slice(0, 120),
    filters: {
      uf: 'CE' as const,
      municipality_ibge_code: side.filters.municipality_ibge_code,
      start_date: side.filters.start_date,
      end_date: side.filters.end_date,
      company_sizes: [...side.filters.company_sizes],
      supplier_origins: [...side.filters.supplier_origins],
      expense_element_codes: [...side.filters.expense_element_codes],
    },
  };
}

export function buildComparisonRequest(left: ComparisonSideDraft, right: ComparisonSideDraft): ComparisonRequest | null {
  const comparison_mode = deriveComparisonMode(left, right);
  if (!comparison_mode) return null;
  return { comparison_mode, left: cleanSide(left), right: cleanSide(right) };
}

export function evolutionRows(items: Array<{
  position: number;
  left_period: string | null;
  right_period: string | null;
  left_published: boolean;
  right_published: boolean;
  compras_consideradas_centavos: ValueComparison;
}>) {
  return items.map((item) => ({
    position: item.position,
    label: item.left_period === item.right_period
      ? periodLabel(item.left_period)
      : `${periodLabel(item.left_period)} × ${periodLabel(item.right_period)}`,
    left: item.left_published ? item.compras_consideradas_centavos.left.value : null,
    right: item.right_published ? item.compras_consideradas_centavos.right.value : null,
  }));
}

function periodLabel(value: string | null): string {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[Number(match[2]) - 1] ?? match[2]}/${match[1]}`;
}

export function comparisonState(value: ValueComparison): 'tie' | 'unavailable' | 'left' | 'right' {
  if (value.ordering === 'UNAVAILABLE' || value.left.value === null || value.right.value === null) return 'unavailable';
  if (value.ordering === 'TIE') return 'tie';
  return value.ordering === 'LEFT_HIGHER' ? 'left' : 'right';
}

