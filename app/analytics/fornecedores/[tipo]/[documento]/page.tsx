import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { SupplierDetailShell } from '@/features/analytics/suppliers/detail-shell';
import { isValidSupplierRoute } from '@/features/analytics/suppliers/detail';

type SupplierDetailPageProps = PageProps<'/analytics/fornecedores/[tipo]/[documento]'>;

export default function SupplierDetailPage(props: SupplierDetailPageProps) {
  return (
    <Suspense fallback={<main className="page-content"><div className="panel h-80 animate-pulse" /></main>}>
      <SupplierDetailContent params={props.params} />
    </Suspense>
  );
}

async function SupplierDetailContent(
  props: { params: SupplierDetailPageProps['params'] },
) {
  const { tipo, documento } = await props.params;
  if (!isValidSupplierRoute(tipo, documento)) notFound();
  return <SupplierDetailShell type={tipo} document={documento} />;
}
