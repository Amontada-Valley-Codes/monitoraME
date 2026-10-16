'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CircleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { money } from '@/shared/lib/format';
import { LoadingState } from '@/shared/components/states';
import { AnalyticsApiError, fetchCommitmentDetail } from './api';
import { cancellationModalityLabel, companySizeLabel, formatCivilDate, formatCompetence, formatTimestamp, nullableLabel, supplierOriginLabel } from './detail-format';
import { getCommitmentErrorContent } from './error-state';
import { supplierHref } from './navigation';
import type { CommitmentDetail } from './types';

type State = { key: string; data: CommitmentDetail | null; error: AnalyticsApiError | null };

export function CommitmentDetailView({ commitmentKey, from }: { commitmentKey: string; from: string }) {
  const [version, setVersion] = useState(0);
  const requestKey = `${commitmentKey}:${version}`;
  const [state, setState] = useState<State>({ key: '', data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    fetchCommitmentDetail(commitmentKey, controller.signal)
      .then((data) => setState({ key: requestKey, data, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ key: requestKey, data: null, error: error instanceof AnalyticsApiError ? error : new AnalyticsApiError(500, 'Erro inesperado.') });
        }
      });
    return () => controller.abort();
    // requestKey captures both the normalized route key and manual retries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const loading = state.key !== requestKey;
  return <div>
    <Button asChild variant="ghost" className="mb-5 pl-0"><Link href={from}><ArrowLeft />Voltar aos empenhos</Link></Button>
    {loading ? <DetailSkeleton /> : state.error ? <DetailError error={state.error} from={from} onRetry={() => setVersion((value) => value + 1)} /> : state.data ? <DetailContent detail={state.data} from={from} /> : null}
  </div>;
}

function DetailSkeleton() {
  return <LoadingState label="Carregando empenho" />;
}

function DetailError({ error, from, onRetry }: { error: AnalyticsApiError; from: string; onRetry: () => void }) {
  if (error.status === 404) {
    return <Alert role="alert" className="panel p-6"><CircleAlert /><AlertTitle>Empenho não encontrado</AlertTitle><AlertDescription><p>O registro informado não foi encontrado.</p><Button asChild variant="outline" className="mt-3"><Link href={from}>Voltar para a lista</Link></Button>{error.requestId && <SupportCode value={error.requestId} />}</AlertDescription></Alert>;
  }
  const content = getCommitmentErrorContent(error.status, error.message);
  const returnTo = typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`;
  const href = error.status === 401 ? `/login?returnTo=${encodeURIComponent(returnTo)}` : error.status === 403 ? `/onboarding/complete?returnTo=${encodeURIComponent(returnTo)}` : content.href;
  return <Alert role="alert" variant="destructive" className="panel p-6"><CircleAlert /><AlertTitle>{content.title}</AlertTitle><AlertDescription><p>{content.description}</p>{href ? <Button asChild variant="outline" className="mt-3"><Link href={href}>{content.action}</Link></Button> : <Button variant="outline" className="mt-3" onClick={onRetry}>{content.action}</Button>}{error.requestId && <SupportCode value={error.requestId} />}</AlertDescription></Alert>;
}

const SupportCode = ({ value }: { value: string }) => <p className="mt-3 font-mono text-xs text-muted-foreground">Código de suporte: {value}</p>;

function DetailContent({ detail, from }: { detail: CommitmentDetail; from: string }) {
  const providerLink = supplierHref(detail.fornecedor, {
    from,
    commitmentDate: detail.data_empenho,
    exercise: detail.classificacao_orcamentaria.exercicio,
  });
  const cancellations = detail.anulacoes ?? [];
  const sede = [detail.fornecedor.municipio_sede, detail.fornecedor.uf_sede].filter(Boolean).join(' / ') || '—';
  const references: Array<[string, string | null]> = [
    ['Estado do empenho', detail.referencias.estado_empenho], ['Contrato', detail.referencias.numero_contrato],
    ['Licitação', detail.referencias.numero_licitacao], ['Empenho substituto', detail.referencias.numero_empenho_substituto],
    ['Nota de anulação informada', detail.referencias.numero_nota_anulacao_informado],
  ];
  return <div className="space-y-6">
    <header className="panel p-6 sm:p-8"><p className="eyebrow text-primary">Detalhe do empenho</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold sm:text-3xl">{detail.display_id}</h1>{detail.possui_anulacao && <Badge variant="outline" className="text-destructive">Com anulação</Badge>}</div><p className="mt-3 text-sm text-muted-foreground">{formatCivilDate(detail.data_empenho)} · {detail.municipio_comprador.nome} / {detail.municipio_comprador.uf} · Competência {formatCompetence(detail.competencia)}</p></header>

    <section className="grid gap-4 md:grid-cols-3" aria-label="Valores do empenho">{[['Valor empenhado', detail.valores.valor_empenhado_centavos], ['Valor anulado', detail.valores.valor_anulado_centavos], ['Valor líquido', detail.valores.valor_liquido_centavos]].map(([label, value]) => <div key={String(label)} className="panel p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="metric mt-3 text-xl">{money(Number(value))}</p></div>)}</section>

    <div className="grid gap-6 xl:grid-cols-3">
      <section className="panel p-6 xl:col-span-2" aria-labelledby="supplier-title"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="supplier-title" className="font-semibold">Fornecedor</h2><p className="mt-3 font-medium">{detail.fornecedor.nome}</p></div>{providerLink && <Button asChild variant="outline"><Link href={providerLink}>Ver fornecedor<ArrowUpRight /></Link></Button>}</div><dl className="mt-6 grid gap-5 sm:grid-cols-2"><Fact label="Porte" value={companySizeLabel(detail.fornecedor.porte)} /><Fact label="Origem" value={supplierOriginLabel(detail.fornecedor.origem)} /><Fact label="Sede" value={sede} /><Fact label="CNAE principal" value={nullableLabel(detail.fornecedor.cnae_principal_codigo)} description={detail.fornecedor.cnae_principal_descricao ?? undefined} /></dl>{detail.fornecedor.observado_em && <p className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">Cadastro observado em {formatTimestamp(detail.fornecedor.observado_em)}, pode diferir da situação na data do empenho.</p>}</section>
      <section className="panel p-6" aria-labelledby="classification-title"><h2 id="classification-title" className="font-semibold">Classificação orçamentária</h2><dl className="mt-5 space-y-4"><Fact label="Exercício" value={detail.classificacao_orcamentaria.exercicio} /><Fact label="Exercício do orçamento" value={detail.classificacao_orcamentaria.exercicio_orcamento_tce} /><Fact label="Órgão / unidade" value={`${detail.classificacao_orcamentaria.codigo_orgao} / ${detail.classificacao_orcamentaria.codigo_unidade_orcamentaria}`} /><Fact label="Natureza" value={detail.classificacao_orcamentaria.codigo_exibicao} description={detail.classificacao_orcamentaria.nome} /></dl></section>
    </div>

    <div className="grid gap-6 lg:grid-cols-2"><section className="panel p-6" aria-labelledby="references-title"><h2 id="references-title" className="font-semibold">Referências</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2">{references.map(([label, value]) => <Fact key={label} label={label} value={nullableLabel(value)} />)}</dl></section><section className="panel p-6" aria-labelledby="cancellations-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="cancellations-title" className="font-semibold">Anulações</h2>{cancellations.length > 0 && <Badge variant="outline" className="border-destructive/30 bg-destructive/5 text-destructive">{cancellations.length} {cancellations.length === 1 ? 'anulação' : 'anulações'}</Badge>}</div>{cancellations.length > 0 ? <div className="mt-4 space-y-3">{cancellations.map((cancellation) => <article key={cancellation.chave_anulacao} className="rounded-lg border bg-muted/20 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">Anulação</p><h3 className="mt-1 font-mono text-sm font-semibold">{nullableLabel(cancellation.numero_anulacao)}</h3></div><div className="text-right"><p className="data-value text-sm font-semibold text-destructive">{money(cancellation.valor_anulacao_centavos)}</p><Badge variant="secondary" className="mt-1.5 font-normal">{cancellationModalityLabel(cancellation.modalidade_anulacao)}</Badge></div></div><dl className="mt-4 grid gap-3 sm:grid-cols-2"><Fact label="Data da anulação" value={formatCivilDate(cancellation.data_anulacao)} /><Fact label="Modalidade" value={cancellationModalityLabel(cancellation.modalidade_anulacao)} /></dl><div className="mt-4 border-t pt-3"><p className="text-xs text-muted-foreground">Descrição</p><p className="mt-1 text-sm leading-relaxed text-foreground">{nullableLabel(cancellation.descricao_anulacao)}</p></div><p className="mt-3 break-all font-mono text-[0.6875rem] text-muted-foreground">Chave: {nullableLabel(cancellation.chave_anulacao)}</p></article>)}</div> : <p className="mt-4 text-sm text-muted-foreground">Sem anulações associadas a este empenho.</p>}</section></div>
    <footer className="border-t pt-4 text-xs text-muted-foreground">Publicação: {detail.publicacao.status} · {formatTimestamp(detail.publicacao.publicado_em)} · lote {detail.publicacao.run_id}</footer>
  </div>;
}

function Fact({ label, value, description }: { label: string; value: string | number; description?: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd>{description && <dd className="mt-1 text-xs text-muted-foreground">{description}</dd>}</div>;
}
