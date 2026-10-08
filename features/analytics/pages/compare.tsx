'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, LoaderCircle, Repeat2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../components/page-header';
import { MunicipalityPicker } from '../components/global-filters';
import { MUNICIPALITIES } from '../data/fixtures';
import { AnalyticsApiError } from '../commitments/api';
import { fetchComparison } from '../comparison/api';
import { buildComparisonRequest, deriveComparisonMode } from '../comparison/model';
import { ComparisonResults } from '../comparison/results';
import type {
  ComparisonMode,
  ComparisonResponse,
  ComparisonSideDraft,
  ExpenseElementCode,
} from '../comparison/types';

const SIZE_OPTIONS = [
  ['ME', 'Microempresa'],
  ['MEI', 'Microempreendedor individual'],
  ['EPP', 'Empresa de pequeno porte'],
  ['OTHER', 'Outros'],
  ['UNKNOWN', 'Não identificado'],
] as const;
const ORIGIN_OPTIONS = [
  ['NO_MUNICIPIO_COMPRADOR', 'No município comprador'],
  ['EM_OUTRO_MUNICIPIO', 'Em outro município'],
  ['FORA_DO_CEARA', 'Fora do Ceará'],
  ['ORIGEM_NAO_IDENTIFICADA', 'Origem não identificada'],
] as const;
const ELEMENT_OPTIONS = [
  ['30', 'Material de consumo'],
  ['32', 'Material, bem ou serviço para distribuição gratuita'],
  ['35', 'Serviços de consultoria'],
  ['39', 'Outros serviços de terceiros — pessoa jurídica'],
  ['40', 'Serviços de TI e comunicação — pessoa jurídica'],
  ['51', 'Obras e instalações'],
  ['52', 'Equipamentos e material permanente'],
] as const;
const MODE_LABELS: Record<ComparisonMode, string> = {
  PERIODS: 'Comparação entre períodos',
  MUNICIPALITIES: 'Comparação entre municípios',
  MIXED: 'Comparação combinada',
};

function cityName(code: string) {
  return MUNICIPALITIES.find((item) => item.id === code)?.name ?? code;
}

function suggestedLabel(side: ComparisonSideDraft) {
  return `${cityName(side.filters.municipality_ibge_code)} ${side.filters.start_date.slice(0, 4)}`;
}

function initialSide(city: string): ComparisonSideDraft {
  const side: ComparisonSideDraft = {
    label: '',
    filters: {
      uf: 'CE',
      municipality_ibge_code: city,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      company_sizes: [],
      supplier_origins: [],
      expense_element_codes: [],
    },
  };
  return { ...side, label: suggestedLabel(side) };
}

export default function Compare() {
  const [left, setLeft] = useState(() => initialSide('2300754'));
  const [right, setRight] = useState(() => initialSide('2312908'));
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [error, setError] = useState<AnalyticsApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const mode = deriveComparisonMode(left, right);
  const invalidDateRange =
    left.filters.start_date > left.filters.end_date ||
    right.filters.start_date > right.filters.end_date;
  const valid =
    mode !== null &&
    !invalidDateRange &&
    /^\d{7}$/.test(left.filters.municipality_ibge_code) &&
    /^\d{7}$/.test(right.filters.municipality_ibge_code) &&
    left.label.trim().length > 0 &&
    right.label.trim().length > 0 &&
    left.label.length <= 120 &&
    right.label.length <= 120;

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (result && !loading) {
      document.getElementById('comparison-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [loading, result]);

  function changeSide(
    setter: typeof setLeft,
    side: ComparisonSideDraft,
    filters: Partial<ComparisonSideDraft['filters']>,
  ) {
    const updated = { ...side, filters: { ...side.filters, ...filters } };
    const changesIdentity =
      'municipality_ibge_code' in filters ||
      'start_date' in filters ||
      'end_date' in filters;
    setter({
      ...updated,
      label: changesIdentity ? suggestedLabel(updated) : side.label,
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = buildComparisonRequest(left, right);
    if (!body || !valid || loading) return;

    controller.current?.abort();
    const requestController = new AbortController();
    controller.current = requestController;
    setLoading(true);
    setError(null);
    try {
      setResult(await fetchComparison(body, requestController.signal));
    } catch (requestError) {
      if (!requestController.signal.aborted) {
        setError(
          requestError instanceof AnalyticsApiError
            ? requestError
            : new AnalyticsApiError(500, 'Erro inesperado.'),
        );
      }
    } finally {
      if (!requestController.signal.aborted) setLoading(false);
    }
  }

  function sameMunicipalityOtherYear() {
    const year = Number(left.filters.start_date.slice(0, 4)) - 1;
    const updated = {
      ...right,
      filters: {
        ...right.filters,
        municipality_ibge_code: left.filters.municipality_ibge_code,
        start_date: `${year}-01-01`,
        end_date: `${year}-12-31`,
      },
    };
    setRight({ ...updated, label: suggestedLabel(updated) });
  }

  function samePeriodOtherMunicipality() {
    const alternative =
      left.filters.municipality_ibge_code === '2312908' ? '2300754' : '2312908';
    const updated = {
      ...right,
      filters: {
        ...right.filters,
        municipality_ibge_code: alternative,
        start_date: left.filters.start_date,
        end_date: left.filters.end_date,
      },
    };
    setRight({ ...updated, label: suggestedLabel(updated) });
  }

  function swapSides() {
    setLeft(right);
    setRight(left);
  }

  const validationMessage = invalidDateRange
    ? 'A data inicial deve ser anterior à data final nos dois recortes.'
    : !mode
      ? 'Escolha municípios ou períodos diferentes.'
      : null;

  return (
    <>
      <PageHeader
        eyebrow="Perspectiva comparativa"
        title="Comparar resultados"
        description="Compare municípios, períodos ou ambos usando dados públicos consolidados."
      />
      <form id="comparison-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
          <ComparisonSidePanel
            title="Recorte A"
            tone="left"
            side={left}
            setSide={setLeft}
            onFilters={(patch) => changeSide(setLeft, left, patch)}
          />
          <Button
            type="button"
            variant="outline"
            className="mx-auto gap-2 rounded-full xl:size-11 xl:px-0"
            onClick={swapSides}
            aria-label="Inverter os recortes A e B"
          >
            <Repeat2 className="size-4" aria-hidden="true" />
            <span className="xl:sr-only">Inverter recortes</span>
          </Button>
          <ComparisonSidePanel
            title="Recorte B"
            tone="right"
            side={right}
            setSide={setRight}
            onFilters={(patch) => changeSide(setRight, right, patch)}
          />
        </div>

        <div className="panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {mode ? MODE_LABELS[mode] : 'Defina recortes diferentes'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Use um atalho para configurar o recorte B.
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={sameMunicipalityOtherYear}>
                Mesmo município, outro ano
              </Button>
              <Button type="button" variant="outline" onClick={samePeriodOtherMunicipality}>
                Mesmo período, outro município
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {validationMessage && (
              <p role="alert" className="text-sm text-destructive">
                {validationMessage}
              </p>
            )}
            <Button type="submit" size="lg" disabled={!valid || loading}>
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Comparando dados...
                </>
              ) : (
                <>
                  <ArrowLeftRight aria-hidden="true" />
                  Comparar recortes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="panel mt-6 p-10 text-center" aria-live="polite">
          <LoaderCircle className="mx-auto mb-3 animate-spin text-primary" />
          <p className="font-medium">Comparando dados...</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta consulta reúne dois recortes e pode levar alguns segundos.
          </p>
        </div>
      )}
      {!loading && error && (
        <ComparisonError
          error={error}
          onRetry={() =>
            document.querySelector<HTMLFormElement>('#comparison-form')?.requestSubmit()
          }
        />
      )}
      {!loading && result && <ComparisonResults data={result} />}
    </>
  );
}

function ComparisonSidePanel({
  title,
  tone,
  side,
  setSide,
  onFilters,
}: {
  title: string;
  tone: 'left' | 'right';
  side: ComparisonSideDraft;
  setSide: (side: ComparisonSideDraft) => void;
  onFilters: (patch: Partial<ComparisonSideDraft['filters']>) => void;
}) {
  const activeFilters =
    side.filters.company_sizes.length +
    side.filters.supplier_origins.length +
    side.filters.expense_element_codes.length;
  const toneColor = tone === 'left' ? 'var(--chart-1)' : 'var(--chart-2)';

  return (
    <fieldset className="panel min-w-0 p-5">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: toneColor }}
          aria-hidden="true"
        />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <Label className="filter-label">Município</Label>
          <MunicipalityPicker
            value={side.filters.municipality_ibge_code}
            onChange={(municipality_ibge_code) => onFilters({ municipality_ibge_code })}
            all={false}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="filter-label">Data inicial</Label>
            <Input
              type="date"
              value={side.filters.start_date}
              max={side.filters.end_date}
              onChange={(event) => onFilters({ start_date: event.target.value })}
            />
          </div>
          <div>
            <Label className="filter-label">Data final</Label>
            <Input
              type="date"
              value={side.filters.end_date}
              min={side.filters.start_date}
              onChange={(event) => onFilters({ end_date: event.target.value })}
            />
          </div>
        </div>
        <div>
          <Label className="filter-label">Nome deste recorte</Label>
          <Input
            value={side.label}
            maxLength={120}
            onChange={(event) => setSide({ ...side, label: event.target.value })}
          />
        </div>
        <details className="group rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium marker:text-muted-foreground">
            Filtros avançados
            {activeFilters > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters} {activeFilters === 1 ? 'ativo' : 'ativos'}
              </Badge>
            )}
          </summary>
          <div className="mt-4 grid gap-5 border-t pt-4 sm:grid-cols-2 2xl:grid-cols-3">
            <CheckGroup
              title="Porte"
              options={SIZE_OPTIONS}
              selected={side.filters.company_sizes}
              onChange={(company_sizes) =>
                onFilters({
                  company_sizes:
                    company_sizes as ComparisonSideDraft['filters']['company_sizes'],
                })
              }
            />
            <CheckGroup
              title="Origem"
              options={ORIGIN_OPTIONS}
              selected={side.filters.supplier_origins}
              onChange={(supplier_origins) =>
                onFilters({
                  supplier_origins:
                    supplier_origins as ComparisonSideDraft['filters']['supplier_origins'],
                })
              }
            />
            <CheckGroup
              title="Elemento de despesa"
              options={ELEMENT_OPTIONS}
              selected={side.filters.expense_element_codes}
              onChange={(expense_element_codes) =>
                onFilters({ expense_element_codes: expense_element_codes as ExpenseElementCode[] })
              }
            />
          </div>
        </details>
      </div>
    </fieldset>
  );
}

function CheckGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: ReadonlyArray<readonly [string, string]>;
  selected: readonly string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-muted-foreground">{title}</legend>
      <div className="space-y-2">
        {options.map(([value, label]) => (
          <Label key={value} className="flex items-start gap-2 text-xs font-normal">
            <Checkbox
              checked={selected.includes(value)}
              onCheckedChange={(checked) =>
                onChange(
                  checked === true
                    ? [...selected, value]
                    : selected.filter((item) => item !== value),
                )
              }
            />
            {label}
          </Label>
        ))}
      </div>
    </fieldset>
  );
}

function ComparisonError({ error, onRetry }: { error: AnalyticsApiError; onRetry: () => void }) {
  const router = useRouter();
  const title =
    error.status === 422
      ? 'Combinação inválida'
      : error.status === 404
        ? 'Município não encontrado'
        : error.status === 401
          ? 'Sua sessão expirou'
          : error.status === 403
            ? 'Cadastro necessário'
            : error.status === 503
              ? 'Serviço indisponível'
              : error.status === 0
                ? 'Sem conexão'
                : 'Erro inesperado';
  const description =
    error.status === 422
      ? 'Revise os municípios, períodos e filtros escolhidos.'
      : error.status === 503
        ? 'O serviço analítico está temporariamente indisponível.'
        : error.message;
  const action =
    error.status === 401
      ? 'Entrar novamente'
      : error.status === 403
        ? 'Completar cadastro'
        : error.status === 422 || error.status === 404
          ? 'Revisar comparação'
          : 'Tentar novamente';

  function act() {
    if (error.status === 401 || error.status === 403) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.push(
        `${error.status === 401 ? '/login' : '/onboarding/complete'}?returnTo=${encodeURIComponent(returnTo)}`,
      );
    } else if (error.status === 422 || error.status === 404) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else onRetry();
  }

  return (
    <Alert role="alert" variant="destructive" className="mt-6">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>
        <Button variant="outline" className="mt-3" onClick={act}>
          {action}
        </Button>
        {error.requestId && (
          <p className="mt-3 font-mono text-xs">Código de suporte: {error.requestId}</p>
        )}
      </AlertDescription>
    </Alert>
  );
}
