import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { SupplierCommitmentsShell } from '@/features/analytics/suppliers/commitments-shell';
import { isValidSupplierRoute } from '@/features/analytics/suppliers/detail';

type SupplierCommitmentsPageProps = PageProps<'/analytics/fornecedores/[tipo]/[documento]/empenhos'>;

export default function SupplierCommitmentsPage(props: SupplierCommitmentsPageProps) {
  return (
    <Suspense fallback={<main className="page-content"><div className="panel h-80 animate-pulse" /></main>}>
      <SupplierCommitmentsContent params={props.params} />
    </Suspense>
  );
}

async function SupplierCommitmentsContent(
  props: { params: SupplierCommitmentsPageProps['params'] },
) {
  const { tipo, documento } = await props.params;
  if (!isValidSupplierRoute(tipo, documento)) notFound();
  return <SupplierCommitmentsShell type={tipo} document={documento} />;
}
