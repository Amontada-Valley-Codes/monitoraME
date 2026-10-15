import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Opportunity } from '../types';
import { SaveOpportunityButton } from './save-opportunity-button';

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opportunity.estimatedValue);
  const closing = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(opportunity.closingDate));
  return <article className="px-4 py-5 transition-colors hover:bg-muted/40 sm:px-6">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{opportunity.organization}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{opportunity.city}/{opportunity.state} · {opportunity.modality}</p></div><Badge className="shrink-0 text-sm" aria-label={`${opportunity.matchScore}% de compatibilidade`}>{opportunity.matchScore}% compatível</Badge></div>
    <h2 className="mt-3 text-base font-semibold leading-snug">{opportunity.title}</h2><p className="mt-1 text-sm text-muted-foreground">{opportunity.description}</p>
    <div className="mt-3 grid gap-3 rounded-xl border bg-muted/50 px-4 py-3 text-xs sm:grid-cols-3"><Metric label="Valor estimado" value={value} /><Metric label="Encerramento" value={closing} /><Metric label="Situação" value="Em aberto" /></div>
    <div className="mt-3"><p className="text-xs font-semibold">Por que combina com a empresa</p><ul className="mt-1.5 flex flex-wrap gap-1.5">{opportunity.matchReasons.map((reason) => <li key={reason}><Badge variant="secondary">{reason}</Badge></li>)}</ul><p className="mt-2 text-xs text-muted-foreground">CNAEs: {opportunity.relatedCnaes.join(' · ')}</p></div>
    <div className="mt-3 flex items-center justify-between border-t pt-3"><Button asChild variant="secondary" size="sm"><Link href={`/oportunidades/${opportunity.id}`}>Ver detalhes<ArrowRight className="size-3.5" /></Link></Button><SaveOpportunityButton opportunity={opportunity} compact /></div>
  </article>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div><span className="eyebrow block text-[10px] text-muted-foreground">{label}</span><span className="data-value font-semibold">{value}</span></div>; }
