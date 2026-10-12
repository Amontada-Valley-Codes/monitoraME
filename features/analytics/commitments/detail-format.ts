const EMPTY_VALUE = '—';

export function nullableLabel(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === '' ? EMPTY_VALUE : String(value);
}

export function formatCivilDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : nullableLabel(value);
}

export function formatCompetence(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return match ? `${match[2]}/${match[1]}` : nullableLabel(value);
}

export function formatTimestamp(value: string | null): string {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

const SIZE_LABELS: Record<string, string> = {
  MEI: 'Microempreendedor individual',
  ME: 'Microempresa',
  EPP: 'Empresa de pequeno porte',
  OTHER: 'Outros portes',
  UNKNOWN: 'Não identificado',
};

const ORIGIN_LABELS: Record<string, string> = {
  NO_MUNICIPIO_COMPRADOR: 'No município comprador',
  EM_OUTRO_MUNICIPIO: 'Em outro município',
  FORA_DO_CEARA: 'Fora do Ceará',
  ORIGEM_NAO_IDENTIFICADA: 'Origem não identificada',
};

export const companySizeLabel = (value: string) => SIZE_LABELS[value] ?? value;
export const supplierOriginLabel = (value: string) => ORIGIN_LABELS[value] ?? value;

const CANCELLATION_MODALITY_LABELS: Record<string, string> = {
  P: 'Parcial',
  T: 'Total',
};

export const cancellationModalityLabel = (value: string) =>
  CANCELLATION_MODALITY_LABELS[value] ?? nullableLabel(value);

export function cancellationSummary(items: unknown[]): {
  count: number;
  label: string;
  description: string;
} {
  const count = items.length;
  return {
    count,
    label: count === 0 ? 'Sem anulações' : `${count} ${count === 1 ? 'anulação' : 'anulações'}`,
    description: count === 0
      ? ''
      : 'Há informações de anulação associadas a este empenho. O formato detalhado ainda não está disponível para exibição.',
  };
}
