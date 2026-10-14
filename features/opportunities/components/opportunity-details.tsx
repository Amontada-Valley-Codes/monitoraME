import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CircleCheck,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Gavel,
  Mail,
  MapPin,
  Search,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OpportunitySidebar } from './opportunity-sidebar';
import type { Opportunity } from '../types';
import { SaveOpportunityButton } from './save-opportunity-button';

type OpportunityDetailsProps = {
  opportunity: Opportunity;
};

const documents = [
  {
    name: 'Edital_PE_014_2024.pdf',
    description: '2,4 MB · 01/11',
    label: 'PDF',
    icon: FileText,
  },
  {
    name: 'Termo_Referencia_Anexo_I.pdf',
    description: '1,1 MB · Especificações',
    label: 'TR',
    icon: FileText,
  },
  {
    name: 'Planilha_Orcamentaria.xlsx',
    description: '420 KB · Matriz de custo',
    label: 'XLS',
    icon: FileSpreadsheet,
  },
  {
    name: 'Minuta_Contrato_Ata.pdf',
    description: '890 KB · Cláusulas',
    label: 'DOC',
    icon: FileText,
  },
];

const communications = [
  {
    category: 'Urgente / Retificação',
    date: 'Há 2h',
    title: 'Retificação do Termo de Referência nº 01',
    description:
      'Ajuste técnico na especificação do item 01. Data e horário de abertura mantidos.',
    meta: 'PDF · 320 KB',
    tone: 'primary',
  },
  {
    category: 'Impugnação nº 01',
    date: '04/11',
    title: 'Julgamento de Impugnação · Qualificação Técnica',
    description:
      'Decisão mantida com parecer jurídico referente à qualificação econômico-financeira.',
    meta: 'Parecer · 540 KB',
    tone: 'warning',
  },
  {
    category: 'Esclarecimento nº 01',
    date: 'Ontem',
    title: 'Atestados de Cooperativas Médicas',
    description:
      'Confirmada a aceitação de atestados emitidos por cooperativas médicas registradas.',
    meta: 'Deferido',
    tone: 'success',
  },
  {
    category: 'Esclarecimento nº 02',
    date: '02/11',
    title: 'Prazos de Entrega e Logística Regional',
    description:
      'Detalhamento do cronograma para remessas fracionadas às unidades regionais.',
    meta: 'Nota técnica',
    tone: 'muted',
  },
] as const;

export function OpportunityDetails({
  opportunity,
}: OpportunityDetailsProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(opportunity.estimatedValue);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(opportunity.openingDate));

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <OpportunitySidebar />

        <main className="min-w-0 flex-1 border-r bg-card">
          <header className="sticky top-0 z-10 flex h-(--header-height) items-center gap-3 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
            <Button asChild variant="ghost" size="icon" aria-label="Voltar para oportunidades">
              <Link href="/oportunidades">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Edital detalhado</p>
              <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {opportunity.modality} · {opportunity.city}, {opportunity.state}
              </h1>
            </div>

            <Button variant="ghost" size="icon" className="ml-auto" aria-label="Compartilhar edital">
              <Share2 className="size-4 text-muted-foreground" />
            </Button>
          </header>

          <div className="space-y-4 p-4 sm:p-6">
            <Card className="gap-5 py-5 shadow-none">
              <CardHeader className="gap-4 px-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    CPS
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="truncate text-base">
                        {opportunity.organization}
                      </CardTitle>
                      <CircleCheck className="size-4 shrink-0 fill-primary text-primary-foreground" />
                    </div>
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-x-2">
                      <span className="text-primary">@cpsmcamocim</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> Ceará · Região Norte
                      </span>
                    </CardDescription>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/60 p-4 sm:p-5">
                  <Badge variant="outline" className="bg-card text-muted-foreground">
                    ID PNCP: 07.598.634/0001-37
                  </Badge>
                  <h2 className="mt-4 text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
                    {opportunity.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {opportunity.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 px-5 sm:px-6">
                <div className="grid gap-4 border-y py-4 sm:grid-cols-3">
                  <Metric label="Valor estimado" value={formattedValue} />
                  <Metric
                    label="Cota MPE"
                    value="R$ 54.605,00"
                    badge="25%"
                    tone="success"
                    className="sm:border-x sm:px-4"
                  />
                  <Metric label="Abertura da sessão" value={formattedDate} tone="warning" />
                </div>

                <dl className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  <Detail label="Modalidade" value={opportunity.modality} />
                  <Detail label="Critério" value="Menor preço por item" />
                  <Detail label="Disputa" value="Aberto / Fechado" />
                  <Detail label="Localização" value={`${opportunity.city} / ${opportunity.state}`} />
                </dl>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {opportunity.officialUrl && (
                    <Button asChild className="sm:flex-1">
                      <a href={opportunity.officialUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                        Acessar edital no PNCP
                      </a>
                    </Button>
                  )}
                  <SaveOpportunityButton opportunity={opportunity} />
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 overflow-hidden py-0 shadow-none">
              <div className="grid grid-cols-2 bg-muted/60 p-1">
                <Button variant="secondary" className="h-10 bg-card shadow-sm">
                  <FileText className="size-4" />
                  Itens (04)
                </Button>
                <Button variant="ghost" className="h-10 text-muted-foreground">
                  <FileText className="size-4" />
                  Anexos (04)
                </Button>
              </div>

              <CardContent className="p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Arquivos oficiais para download</p>
                  <Badge variant="outline">ICP-Brasil</Badge>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {documents.map(({ name, description, label, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {label} · {description}
                        </span>
                      </span>
                      <Download className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 py-0 shadow-none">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Gavel className="size-4 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Pregoeiro: Carlos Eduardo Lima</p>
                    <p className="text-xs text-muted-foreground">Portaria CPS nº 042/2024</p>
                  </div>
                </div>

                <a
                  href="mailto:licitacao@consorciocamocim.ce.gov.br"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="size-4" />
                  licitacao@consorciocamocim.ce.gov.br
                </a>
              </CardContent>
            </Card>
          </div>
        </main>

        <aside className="hidden w-80 shrink-0 bg-background px-5 py-6 lg:block 2xl:w-96 2xl:px-6">
          <div className="sticky top-6 space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Buscar órgãos, atas e certames"
                placeholder="Buscar órgãos, atas e certames..."
                className="bg-card pl-9"
              />
            </div>

            <Card className="gap-4 py-5 shadow-none">
              <CardHeader className="gap-2 px-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Comunicados oficiais</CardTitle>
                    <CardDescription className="mt-1">
                      5 registros do Pregoeiro e CPL
                    </CardDescription>
                  </div>
                  <Badge className="bg-success-soft text-success hover:bg-success-soft">Hoje 11:20</Badge>
                </div>
              </CardHeader>

              <CardContent className="px-5">
                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 border-b pb-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Todas (5)</span>
                  <span>Avisos (2)</span>
                  <span>Impugnações (1)</span>
                </div>

                <div className="space-y-5">
                  {communications.map((item) => (
                    <article
                      key={item.title}
                      className={`border-l-2 pl-3 ${communicationBorder[item.tone]}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`eyebrow text-[10px] ${communicationText[item.tone]}`}>
                          {item.category}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="mt-1 text-sm font-medium leading-snug">{item.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
                        <span>Pregoeiro / CPL</span>
                        <span>{item.meta}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <Building2 className="size-3.5" />
              Fonte oficial: PNCP
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const communicationBorder = {
  primary: 'border-primary',
  warning: 'border-warning',
  success: 'border-success',
  muted: 'border-border',
} as const;

const communicationText = {
  primary: 'text-primary',
  warning: 'text-warning',
  success: 'text-success',
  muted: 'text-muted-foreground',
} as const;

function Metric({
  label,
  value,
  badge,
  tone = 'primary',
  className = '',
}: {
  label: string;
  value: string;
  badge?: string;
  tone?: 'primary' | 'success' | 'warning';
  className?: string;
}) {
  const toneClass = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
  }[tone];

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className={`eyebrow ${toneClass}`}>{label}</span>
        {badge && <Badge className="bg-success text-white hover:bg-success">{badge}</Badge>}
      </div>
      <p className={`metric mt-1 text-lg font-semibold ${tone === 'primary' ? 'text-foreground' : toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <dt className="eyebrow text-[10px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
