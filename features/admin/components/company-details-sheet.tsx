'use client';

import Link from 'next/link';
import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { accessStatusLabel, companySizeLabel, formatCnpj } from '../rules';
import type { AdminCompany, CompanyAccessStatus } from '../types';

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export function AccessStatusBadge({ status }: { status: CompanyAccessStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        status === 'active' && 'bg-success-soft text-success',
        status === 'pending' && 'bg-warning-soft text-warning',
        status === 'suspended' && 'bg-destructive/10 text-destructive',
        status === 'rejected' && 'bg-muted text-muted-foreground',
      )}
    >
      {accessStatusLabel[status]}
    </Badge>
  );
}

export function CompanyDetailsSheet({ company, onClose }: { company: AdminCompany | null; onClose: () => void }) {
  return (
    <Sheet open={company !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {company && (
          <>
            <SheetHeader className="border-b p-5 pr-12">
              <div><AccessStatusBadge status={company.access_status} /></div>
              <SheetTitle className="text-lg leading-snug">{company.legal_name}</SheetTitle>
              <SheetDescription>{company.trade_name ?? 'Sem nome fantasia'} · CNPJ {formatCnpj(company.cnpj)}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 p-5">
              <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Porte</dt>
                <dd>{companySizeLabel[company.company_size]}</dd>
                <dt className="text-muted-foreground">Município</dt>
                <dd>{company.municipality.name}/{company.municipality.uf} · IBGE {company.municipality.ibge_code}</dd>
                <dt className="text-muted-foreground">CNAE principal</dt>
                <dd>{company.primary_cnae.code} — {company.primary_cnae.description}</dd>
                <dt className="text-muted-foreground">Plano</dt>
                <dd>{company.plan_name ?? 'Sem plano ativo'}</dd>
                <dt className="text-muted-foreground">Contato</dt>
                <dd className="break-all">{company.contact_email}</dd>
                <dt className="text-muted-foreground">Cadastro</dt>
                <dd>{formatDateTime(company.registered_at)}</dd>
                <dt className="text-muted-foreground">Atualização</dt>
                <dd>{formatDateTime(company.updated_at)}</dd>
              </dl>

              {company.access_request && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                  <span>
                    Solicitação <b className="font-semibold">{company.access_request.protocol}</b> · {company.access_request.documents_count} documento(s)
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/access-requests/${company.access_request.protocol}`}>Ver solicitação</Link>
                  </Button>
                </div>
              )}

              <section className="border-t pt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4" />
                  Histórico de acesso
                </h3>
                <ol className="mt-3 space-y-3">
                  {company.status_history.map((event) => (
                    <li key={event.id} className="flex gap-3 text-sm">
                      <AccessStatusBadge status={event.status} />
                      <div className="min-w-0">
                        <p><b className="font-semibold">{event.author_name}</b></p>
                        {event.reason && <p className="text-xs text-muted-foreground">Motivo: {event.reason}</p>}
                        <time className="text-xs text-muted-foreground" dateTime={event.occurred_at}>{formatDateTime(event.occurred_at)}</time>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
