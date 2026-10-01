'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  Braces,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileSearch,
  MapPin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/shared/components/logo';
import { TCE_MUNICIPALITIES } from '@/features/analytics/pipeline/municipalities';

const connectorWords = new Set(['DA', 'DAS', 'DE', 'DO', 'DOS', 'E']);

function municipalityLabel(name: string) {
  return name
    .split(' ')
    .map((word, index) => {
      if (index > 0 && connectorWords.has(word)) return word.toLowerCase();
      return `${word.charAt(0)}${word.slice(1).toLowerCase()}`;
    })
    .join(' ');
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

const municipalities = TCE_MUNICIPALITIES.map((municipality) => ({
  ...municipality,
  label: municipalityLabel(municipality.name),
}));

const modules = [
  {
    title: 'Auditoria Cota LC 123/06',
    description:
      'Validação automática das reservas de 25% em certames e licitações exclusivas de até R$ 80 mil para micro e pequenas empresas.',
    icon: Braces,
    featured: true,
  },
  {
    title: 'Radar de Oportunidades MPE',
    description:
      'Editais abertos nos municípios cearenses, com alertas em tempo real e filtros georreferenciados.',
    icon: BarChart3,
  },
  {
    title: 'Retenção vs. Evasão Fiscal',
    description:
      'Métricas econômicas que mostram quanto do valor pago permanece na economia regional ou se perde para outros estados.',
    icon: CircleDollarSign,
  },
  {
    title: 'Raio-X de Credores & Contratos',
    description:
      'Mapeamento transparente de fornecedores, vínculos e atividades contratadas com cruzamento automatizado.',
    icon: FileSearch,
  },
];

const processSteps = [
  {
    title: 'Ingestão mensal',
    description: 'Extração programada e segura dos dados brutos de empenho, liquidação e pagamento.',
  },
  {
    title: 'Harmonização',
    description: 'Normalização de códigos, portes empresariais e recortes territoriais.',
  },
  {
    title: 'Inteligência cívica',
    description: 'Detecção de alertas por regras de negócio, compras fracionadas e ausência de cota.',
  },
  {
    title: 'Ação & fomento',
    description: 'Painéis intuitivos para gestores e alertas para fornecedores locais de cada município.',
  },
];

const testimonials = [
  {
    quote:
      'Com o MonitoraME descobrimos que menos de 14% das compras da nossa região beneficiavam pequenas empresas locais. Com os relatórios, reajustamos nossos editais para cumprir a LC 123.',
    initials: 'MC',
    name: 'Marcos Carneiro',
    role: 'Controlador Municipal · Sobral/CE',
  },
  {
    quote:
      'Receber as notificações de dispensas e licitações do município permitiu à minha marcenaria vencer três cotações públicas neste semestre. Um divisor de águas.',
    initials: 'AL',
    name: 'Ana Lúcia Vasconcelos',
    role: 'Empreendedora MEI · Quixadá/CE',
  },
  {
    quote:
      'A facilidade para consultar a retenção e a evasão orienta os municípios cearenses a criar processos mais transparentes e compatíveis com a realidade local.',
    initials: 'RF',
    name: 'Prof. Roberto Farias',
    role: 'Pesquisador em Políticas Públicas',
  },
];

export function LandingPage() {
  const router = useRouter();
  const [municipality, setMunicipality] = useState('');
  const [error, setError] = useState('');

  function submitMunicipality(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = normalize(municipality);
    const match = municipalities.find(
      (item) => item.code === query || normalize(item.name) === query,
    );

    if (!match) {
      setError('Selecione um município válido do Ceará.');
      return;
    }

    setError('');
    const searchParams = new URLSearchParams({
      codigo_municipio: match.code,
      ano: String(new Date().getFullYear()),
    });
    router.push(`/analitico?${searchParams.toString()}`);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="MonitoraME — página inicial" className="text-foreground">
            <Logo className="h-6 w-auto sm:h-7" />
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-7 text-xs text-muted-foreground md:flex">
            <Link className="transition-colors hover:text-foreground" href="#inicio">Início</Link>
            <Link className="transition-colors hover:text-foreground" href="#sobre">Sobre</Link>
            <Link className="transition-colors hover:text-foreground" href="#modulos">Módulos</Link>
            <Link className="transition-colors hover:text-foreground" href="#metodologia">Metodologia</Link>
            <Link className="transition-colors hover:text-foreground" href="#casos">Casos</Link>
            <Link className="flex items-center gap-1 transition-colors hover:text-foreground" href="#fontes">
              Dados abertos <ChevronDown className="size-3" />
            </Link>
          </nav>

          <Button asChild className="rounded-full bg-foreground px-5 text-xs text-background hover:bg-foreground/85">
            <Link href="/login">Acessar painel</Link>
          </Button>
        </div>
      </header>

      <main>
        <section id="inicio" className="relative border-b">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_29%)]" />
          <div className="relative mx-auto grid min-h-145 max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary/60 px-3 py-1.5 text-[11px] font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Observatório de Compras Públicas · Ceará
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[4.3rem]">
                Inteligência e <span className="text-primary">transparência</span> nas compras públicas.
              </h1>
              <p className="mt-7 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Conectamos dados do TCE-CE, PNCP e Receita Federal para auditar despesas, garantir os direitos de MPEs e reter o capital nos municípios cearenses.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full px-6 shadow-sm">
                  <Link href="/analitico">Explore municípios</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full bg-card px-6">
                  <Link href="/analitico/metodologia">Ver metodologia</Link>
                </Button>
              </div>
            </div>

            <Card id="consulta" className="relative mx-auto w-full max-w-135 scroll-mt-28 overflow-hidden border-white/10 bg-foreground py-0 text-primary-foreground shadow-[0_26px_70px_-35px_rgb(0_20_41/55%)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_10%,color-mix(in_srgb,var(--primary)_24%,transparent)_100%)]" />
              <CardHeader className="relative px-7 pt-7 sm:px-9 sm:pt-9">
                <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-primary-foreground/70">
                  <span className="size-2 rounded-full bg-brand" /> Consulta aberta
                </div>
                <CardTitle className="text-2xl font-bold text-white">Consulte seu município</CardTitle>
                <CardDescription className="max-w-md text-xs leading-5 text-primary-foreground/70">
                  Acesse instantaneamente as informações de despesas, credores e conformidade da LC 123.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative px-7 pb-7 sm:px-9 sm:pb-9">
                <form onSubmit={submitMunicipality} noValidate>
                  <label htmlFor="municipality" className="sr-only">Município do Ceará</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-primary-foreground/65" />
                    <Input
                      id="municipality"
                      list="municipalities"
                      value={municipality}
                      onChange={(event) => {
                        setMunicipality(event.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Digite o município"
                      autoComplete="off"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'municipality-error' : undefined}
                      className="h-13 rounded-xl border-white/15 bg-black/25 pl-11 text-sm text-white placeholder:text-white/45 focus-visible:border-brand focus-visible:ring-brand/30"
                    />
                    <datalist id="municipalities">
                      {municipalities.map((item) => (
                        <option key={item.code} value={item.label} />
                      ))}
                    </datalist>
                  </div>
                  {error && (
                    <p id="municipality-error" role="alert" className="mt-2 text-xs text-red-300">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="mt-4 h-13 w-full rounded-xl bg-brand text-sm text-white hover:bg-brand/85">
                    Consultar <ArrowRight className="size-4" />
                  </Button>
                </form>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] text-primary-foreground/55">
                  <span>{municipalities.length} municípios integrados</span>
                  <span className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-brand" /> Base atualizada</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="fontes" className="border-b bg-secondary/25">
          <div className="mx-auto max-w-5xl px-5 py-9 text-center sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Fontes integradas, harmonizadas e auditadas em tempo real
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs font-medium text-muted-foreground sm:gap-x-14">
              {['TCE-CE', 'SIM / SICON', 'PNCP', 'Open CNPJ', 'IBGE'].map((source) => (
                <span key={source} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />{source}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow text-primary">Inteligência aplicada</p>
              <h2 className="mt-4 max-w-sm text-3xl font-bold leading-[1.05] sm:text-4xl">
                Como transformamos dados públicos em oportunidades?
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">
                Algoritmos desenvolvidos para identificar brechas de conformidade, aumentar a competitividade de pequenos negócios locais e otimizar o orçamento municipal.
              </p>
              <Button asChild variant="outline" className="mt-7 rounded-full bg-card px-5">
                <Link href="#modulos">Conhecer todos os módulos</Link>
              </Button>
            </div>

            <div id="modulos" className="grid scroll-mt-28 gap-4 sm:grid-cols-2">
              {modules.map(({ title, description, icon: Icon, featured }) => (
                <Card key={title} className={`min-h-70 justify-between shadow-none transition-transform duration-300 hover:-translate-y-1 ${featured ? 'border-primary bg-brand text-white' : 'bg-card'}`}>
                  <CardHeader>
                    <div className={`mb-5 flex size-10 items-center justify-center rounded-xl ${featured ? 'bg-white/15 text-white' : 'bg-secondary text-primary'}`}>
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className={`text-xs leading-5 ${featured ? 'text-white/80' : ''}`}>
                      {description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className={`inline-flex items-center gap-2 text-xs font-medium ${featured ? 'text-white' : 'text-foreground'}`}>
                      Saiba mais <ArrowRight className="size-3.5" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="metodologia" className="border-y bg-card">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-primary">Do dado à decisão</p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Processo comprovado de auditoria</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Garantimos integridade e segurança analítica em cada etapa da jornada de dados.
              </p>
            </div>

            <div className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-5">
              <div className="absolute left-[12.5%] right-[12.5%] top-11 hidden h-px bg-border md:block" />
              {processSteps.map((step, index) => (
                <div key={step.title} className="relative text-center">
                  <span className="metric text-4xl font-semibold text-primary/25">{String(index + 1).padStart(2, '0')}</span>
                  <span className="relative z-10 mx-auto mt-5 block size-2.5 rounded-full border-2 border-card bg-primary ring-4 ring-card" />
                  <h3 className="mt-6 text-sm font-semibold">{step.title}</h3>
                  <p className="mx-auto mt-3 max-w-60 text-xs leading-5 text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="casos" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow text-primary">Impacto real</p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">O que dizem os parceiros e usuários</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" /> Resultados em todo o Ceará
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full gap-5 bg-card shadow-none">
                <CardContent className="flex h-full flex-col pt-1">
                  <p className="flex-1 text-sm italic leading-6 text-muted-foreground">“{testimonial.quote}”</p>
                  <div className="mt-7 flex items-center gap-3 border-t pt-5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-semibold text-primary">
                      {testimonial.initials}
                    </span>
                    <span>
                      <strong className="block text-xs">{testimonial.name}</strong>
                      <span className="text-[10px] text-muted-foreground">{testimonial.role}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-7 py-10 text-primary-foreground shadow-[0_24px_60px_-35px_rgb(0_20_41/60%)] sm:px-11 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,color-mix(in_srgb,var(--primary)_30%,transparent),transparent_38%)]" />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Monitore o seu município agora mesmo.</h2>
              <p className="mt-3 text-sm leading-6 text-primary-foreground/70">
                Tenha acesso instantâneo ao raio-x de empenhos, fornecedores e cumprimento de cotas públicas para micro e pequenas empresas.
              </p>
            </div>
            <div className="relative mt-7 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
              <Button asChild className="rounded-full bg-brand px-6 text-white hover:bg-brand/85">
                <Link href="/analitico">Acessar área pública</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                <Link href="/register">Sou MPE ou gestor <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 text-[10px] text-muted-foreground sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Logo className="h-4 w-auto text-foreground" />
            <span>© 2026 MonitoraME. Dados abertos nos termos da LAI.</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/analitico/metodologia" className="hover:text-foreground">Termos de uso</Link>
            <Link href="/analitico/metodologia" className="hover:text-foreground">Privacidade & LGPD</Link>
            <Link href="/analitico" className="hover:text-foreground">API aberta</Link>
            <a href="https://www.tce.ce.gov.br/" target="_blank" rel="noreferrer" className="hover:text-foreground">Portal TCE-CE</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
