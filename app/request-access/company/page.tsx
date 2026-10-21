import { CompanyAccessShell } from '@/features/company-access/components/company-access-shell';

export default function CompanyAccessPage() {
  return (
    <main className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center">Habilitação Empresarial</h1>
        <p className="text-muted-foreground text-center mb-8">Complete as etapas para submeter a solicitação de acesso da sua empresa.</p>
        <CompanyAccessShell />
      </div>
    </main>
  );
}
