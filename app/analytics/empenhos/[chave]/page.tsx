import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, ReceiptText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { safeCommitmentListPath } from '@/features/analytics/commitments/navigation';

type DetailProps = {
  params: Promise<{ chave: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
};

export default function CommitmentDetailPage(props: DetailProps) {
  return (
    <Suspense fallback={<main className="page-content"><div className="panel h-48 animate-pulse" /></main>}>
      <DetailContent {...props} />
    </Suspense>
  );
}

async function DetailContent({ params, searchParams }: DetailProps) {
  const [{ chave }, query] = await Promise.all([params, searchParams]);
  const rawFrom = Array.isArray(query.from) ? query.from[0] : query.from;
  const from = safeCommitmentListPath(rawFrom);

  return (
    <main className="page-content min-h-screen">
      <Button asChild variant="ghost" className="mb-5 pl-0">
        <Link href={from}><ArrowLeft />Voltar aos empenhos</Link>
      </Button>
      <section className="panel p-6 sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ReceiptText aria-hidden="true" />
        </div>
        <p className="eyebrow text-primary">Detalhe do empenho</p>
        <h1 className="mt-2 text-2xl font-semibold">{chave}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          A chave completa foi preservada na navegação. Os demais dados do detalhe serão exibidos quando o endpoint de detalhe estiver disponível.
        </p>
      </section>
    </main>
  );
}
