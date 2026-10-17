'use client';

import type { FormEvent } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookmarkCheck,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  DatabaseZap,
  FileSearch,
  Landmark,
  MapPin,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  ChevronsUpDown,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TCE_MUNICIPALITIES } from '@/features/analytics/pipeline/municipalities';
import { useProtectedNavigate } from '@/shared/auth/protected-navigation';
import { Logo, LogoIcon } from '@/shared/components/logo';

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

const audiences = [
  {
    title: 'Empresas locais',
    description:
      'Descubra oportunidades compatíveis com sua atividade e seu território.',
    icon: Building2,
  },
  {
    title: 'Gestão pública',
    description:
      'Acompanhe participação de MPEs, recursos locais e qualidade das compras.',
    icon: Landmark,
  },
  {
    title: 'Controle e análise',
    description:
      'Transforme bases públicas dispersas em uma leitura comparável e confiável.',
    icon: SearchCheck,
  },
];

const modules = [
  {
    title: 'Auditoria da LC 123/06',
    description:
      'Identifique reservas de 25% e licitações exclusivas de até R$ 80 mil para micro e pequenas empresas.',
    icon: ShieldCheck,
    tone: 'dark',
  },
  {
    title: 'Radar de oportunidades MPE',
    description:
      'Encontre editais abertos nos municípios cearenses com filtros por atividade e localização.',
    icon: TrendingUp,
    tone: 'light',
  },
  {
    title: 'Retenção e evasão de recursos',
    description:
      'Entenda quanto do valor contratado permanece na economia do município ou segue para outras regiões.',
    icon: CircleDollarSign,
    tone: 'light',
  },
  {
    title: 'Raio-X de credores e contratos',
    description:
      'Mapeie fornecedores, vínculos, empenhos e atividades contratadas com dados públicos harmonizados.',
    icon: FileSearch,
    tone: 'blue',
  },
];

const opportunityBenefits = [
  {
    title: 'Busca que reduz o ruído',
    description:
      'Filtre oportunidades por município, categoria, modalidade e período de publicação.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Compatibilidade explicada',
    description:
      'Entenda por que uma compra pode fazer sentido para o perfil e a área de atuação da empresa.',
    icon: SearchCheck,
  },
  {
    title: 'Acompanhamento organizado',
    description:
      'Salve editais relevantes e mantenha prazos e próximas ações reunidos em um só lugar.',
    icon: BookmarkCheck,
  },
];

const processSteps = [
  [
    '01',
    'Coletamos',
    'Integramos bases públicas de compras, empenhos e fornecedores.',
  ],
  [
    '02',
    'Organizamos',
    'Padronizamos despesas, portes empresariais e recortes territoriais.',
  ],
  [
    '03',
    'Analisamos',
    'Aplicamos regras de negócio e transformamos registros em indicadores.',
  ],
  [
    '04',
    'Você decide',
    'Entregamos uma leitura simples para orientar ação e planejamento.',
  ],
];

const faqs = [
  {
    question: 'O que é o monitoraME e para quem ele foi criado?',
    answer:
      'O monitoraME é uma plataforma de inteligência em compras públicas. Ela organiza dados para apoiar empresas na descoberta de oportunidades, gestores públicos na análise do mercado fornecedor e equipes de controle na leitura de contratos, despesas e indicadores territoriais.',
  },
  {
    question: 'Quais fontes de dados são utilizadas?',
    answer:
      'A plataforma integra dados públicos de fontes como o Tribunal de Contas do Estado do Ceará (TCE-CE), o Portal Nacional de Contratações Públicas (PNCP) e cadastros públicos da Receita Federal. Cada indicador depende da disponibilidade e da qualidade da informação publicada pelos órgãos de origem.',
  },
  {
    question: 'Com que frequência as informações são atualizadas?',
    answer:
      'As rotinas de coleta e processamento acompanham a disponibilização das bases oficiais. Como cada fonte possui calendário e formato próprios, pode existir um intervalo entre a publicação do órgão e a consolidação no monitoraME. A referência temporal exibida no painel indica o período consultado.',
  },
  {
    question: 'Como a plataforma ajuda micro e pequenas empresas?',
    answer:
      'Empresas podem localizar editais e compras compatíveis com sua atuação, filtrar oportunidades por município e analisar o histórico de fornecedores e objetos contratados. Isso reduz o tempo gasto procurando informações dispersas e melhora a preparação comercial.',
  },
  {
    question: 'Como funciona a análise da Lei Complementar 123/06?',
    answer:
      'O sistema aplica regras analíticas aos dados disponíveis para destacar situações relacionadas ao tratamento favorecido às micro e pequenas empresas, como licitações exclusivas de até R$ 80 mil e reservas de cota. Os resultados apoiam a análise, mas não substituem a avaliação jurídica e documental de cada processo.',
  },
  {
    question: 'O monitoraME substitui os portais oficiais?',
    answer:
      'Não. O monitoraME funciona como uma camada de organização e inteligência sobre dados públicos. Para participar de uma contratação ou validar documentos, prazos e condições, a empresa deve sempre consultar o edital e o portal oficial responsável pelo processo.',
  },
  {
    question: 'Meus dados e minhas buscas ficam protegidos?',
    answer:
      'A navegação pública utiliza informações abertas. Recursos vinculados a uma conta seguem controles de acesso da plataforma. O monitoraME não altera registros oficiais e apresenta os dados de origem de forma tratada para facilitar consulta, comparação e tomada de decisão.',
  },
  {
    question: 'Posso solicitar uma demonstração ou apoio para minha organização?',
    answer:
      'Sim. Empresas, municípios e equipes técnicas podem conversar com o time para entender os módulos disponíveis e avaliar o uso mais adequado ao seu contexto. Use o canal de contato ao final da página para solicitar uma apresentação.',
  },
];

const whatsappUrl =
  'https://wa.me/5588999513204?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20melhor%20a%20MonitoraME.';

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const protectedNavigate = useProtectedNavigate();
  const [municipality, setMunicipality] = useState('');
  const [municipalityOpen, setMunicipalityOpen] = useState(false);
  const [error, setError] = useState('');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const selectedMunicipality = municipalities.find(
    (item) => item.code === municipality,
  );

  useEffect(() => {
    const updateHeader = () => setHeaderScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      anchors: { offset: -80 },
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    if (reduceMotion) {
      return () => {
        gsap.ticker.remove(updateLenis);
        lenis.destroy();
      };
    }

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to('[data-hero-reveal]', {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
        })
        .to(
          '[data-hero-proof]',
          { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 },
          '-=0.35',
        );

      gsap.utils.toArray<HTMLElement>('[data-reveal-section]').forEach((section) => {
        const items = section.querySelectorAll<HTMLElement>('[data-reveal-item]');
        if (!items.length) return;

        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((element) => {
        gsap.to(element, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      });

      gsap.to('[data-scroll-progress]', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
        },
      });

      const faqSection = rootRef.current?.querySelector<HTMLElement>('[data-faq-section]');
      const faqViewport = rootRef.current?.querySelector<HTMLElement>('[data-faq-viewport]');
      const faqTrack = rootRef.current?.querySelector<HTMLElement>('[data-faq-track]');

      if (faqSection && faqViewport && faqTrack) {
        const distance = () =>
          Math.max(0, faqTrack.scrollHeight - faqViewport.clientHeight);

        gsap.to(faqTrack, {
          y: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: faqSection,
            start: 'top top',
            end: () =>
              `+=${Math.max(distance(), faqViewport.clientHeight * 0.85)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
        resizeObserver.observe(faqTrack);
        return () => resizeObserver.disconnect();
      }
    }, rootRef);

    return () => {
      context.revert();
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

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
    const year = String(new Date().getFullYear());
    const searchParams = new URLSearchParams({
      municipality_tce_code: match.code,
      start_date: `${year}-01-01`,
      end_date: `${year}-12-31`,
    });
    void protectedNavigate(`/analitico/municipios?${searchParams.toString()}`);
  }

  const headerNavLinkClass = headerScrolled
    ? 'transition-colors hover:text-primary'
    : 'transition-colors hover:text-white';

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-hidden bg-landing-paper text-foreground">
      <div
        data-scroll-progress
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-60 h-0.5 origin-left scale-x-0 bg-[#76a5ff]"
      />
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${headerScrolled
            ? 'border-border/65 bg-card/82 shadow-[0_10px_35px_-24px_rgb(0_20_41/45%)] backdrop-blur-xl'
            : 'border-transparent bg-transparent shadow-none backdrop-blur-none'
          }`}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            aria-label="MonitoraME — página inicial"
            className={`transition-colors duration-300 ${headerScrolled ? 'text-brand-ink' : 'text-white'}`}
          >
            <Logo className="h-6 w-auto sm:h-7" />
          </Link>
          <nav
            aria-label="Navegação principal"
            className={`hidden items-center gap-7 text-xs font-medium transition-colors duration-300 lg:flex ${headerScrolled ? 'text-muted-foreground' : 'text-white/75'
              }`}
          >
            <Link className={headerNavLinkClass} href="#plataforma">
              Plataforma
            </Link>
            <Link className={headerNavLinkClass} href="#oportunidades">
              Oportunidades
            </Link>
            <Link className={headerNavLinkClass} href="#solucoes">
              Soluções
            </Link>
            <Link
              className={headerNavLinkClass}
              href="#metodologia"
            >
              Metodologia
            </Link>
            <Link className={headerNavLinkClass} href="#faq">
              Dúvidas
            </Link>
            <Link className={headerNavLinkClass} href="#contato">
              Contato
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className={`hidden rounded-full px-4 text-xs transition-colors sm:inline-flex ${headerScrolled
                  ? 'text-foreground hover:bg-muted'
                  : 'text-white hover:bg-white/10 hover:text-white'
                }`}
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              asChild
              className={`rounded-full px-5 text-xs transition-colors ${headerScrolled
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/80'
                  : 'bg-white! text-[#0a1930]! shadow-lg shadow-black/10 hover:bg-white/90!'
                }`}
            >
              <Link href="/analitico">
                Acessar compras públicas <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section
          id="inicio"
          className="relative min-h-dvh overflow-hidden bg-landing-ink text-white lg:min-h-dvh-90"
        >
          <Image
            src="/landing/hero-david.webp"
            alt="Profissionais analisando informações públicas em um ambiente de trabalho colaborativo"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[66%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--landing-ink)_0%,color-mix(in_srgb,var(--landing-ink)_96%,transparent)_38%,color-mix(in_srgb,var(--landing-ink)_40%,transparent)_72%,color-mix(in_srgb,var(--landing-ink)_12%,transparent)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--landing-ink)_0%,transparent_34%)]" />
          <div className="relative mx-auto flex min-h-180 max-w-7xl flex-col justify-center gap-10 px-5 pb-12 pt-28 sm:gap-12 sm:px-8 sm:pb-16 sm:pt-32 lg:min-h-190">
            <div className="flex max-w-2xl flex-col gap-6 sm:gap-7">
              <h1 data-hero-reveal className="text-[clamp(2.9rem,4vw,5.6rem)] font-bold leading-[0.94] tracking-[-0.06em] text-white">
                Mais oportunidade para quem vende e clareza para quem decide.
              </h1>
              <p data-hero-reveal className="max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                Transformamos dados dispersos de compras públicas em clareza para gestores e oportunidades para pequenos negócios.
              </p>
              <div data-hero-reveal className="flex flex-wrap gap-3 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-card px-6 text-foreground hover:bg-card/88 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80"
                >
                  <Link href="#consulta">
                    Consultar meu município <ArrowDownRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/12 hover:text-white"
                >
                  <Link href="/analitico">Explorar dados públicos</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-xs text-white/64 sm:pt-6">
                <span data-hero-proof className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#8fb4ff]" />
                  TCE
                </span>
                <span data-hero-proof className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#8fb4ff]" />
                  PNCP
                </span>
                <span data-hero-proof className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#8fb4ff]" />
                  Receita Federal
                </span>
              </div>
            </div>

          <section id="consulta" className="z-10 w-full scroll-mt-28">
            <div data-hero-reveal className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl bg-card shadow-[0_24px_70px_-30px_rgb(0_20_41/35%)] lg:grid-cols-[0.72fr_1.28fr]">
            <div className="flex flex-col justify-center gap-3 bg-landing-blue p-7 text-white sm:p-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/65">
                Consulta aberta
              </p>
              <h2 className="text-2xl font-bold text-white">
                Comece pelo seu município.
              </h2>
            </div>
            <form
              onSubmit={submitMunicipality}
              noValidate
              className="flex flex-col justify-center gap-4 p-7 sm:p-9 md:flex-row md:items-start"
            >
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="municipality"
                  className="mb-2 block text-xs font-semibold text-foreground"
                >
                  Município do Ceará
                </label>
                <Popover
                  open={municipalityOpen}
                  onOpenChange={setMunicipalityOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id="municipality"
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={municipalityOpen}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'municipality-error' : undefined}
                      className="h-12 w-full justify-between rounded-full bg-background px-4 font-normal"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <MapPin className="size-4 shrink-0 text-primary" />
                        <span
                          className={
                            selectedMunicipality
                              ? 'truncate text-foreground'
                              : 'truncate text-muted-foreground'
                          }
                        >
                          {selectedMunicipality?.label ??
                            'Selecione um município'}
                        </span>
                      </span>
                      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Pesquisar por nome ou código..." />
                      <CommandList className="max-h-72">
                        <CommandEmpty>Município não encontrado.</CommandEmpty>
                        <CommandGroup heading="Municípios do Ceará">
                          {municipalities.map((item) => (
                            <CommandItem
                              key={item.code}
                              value={`${item.label} ${item.code}`}
                              onSelect={() => {
                                setMunicipality(item.code);
                                setMunicipalityOpen(false);
                                setError('');
                              }}
                              className="py-2.5"
                            >
                              <Check
                                className={`size-4 ${municipality === item.code ? 'opacity-100' : 'opacity-0'}`}
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {item.label}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {item.code}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {error && (
                  <p
                    id="municipality-error"
                    role="alert"
                    className="mt-2 text-xs text-destructive"
                  >
                    {error}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="mt-6 h-12 rounded-full px-6 md:shrink-0"
              >
                Ver dados do município <ArrowRight className="size-4" />
              </Button>
            </form>
            </div>
          </section>
          </div>
        </section>

        <section
          id="plataforma"
          data-reveal-section
          className="scroll-mt-20 bg-landing-paper px-5 pb-24 pt-28 sm:px-8 lg:pb-32 lg:pt-36"
        >
          <div className="mx-auto max-w-7xl">
            <div data-reveal-item className="grid items-end gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <h2 className="mt-4 text-3xl font-bold leading-[1.05] sm:text-5xl">
                  A informação certa para quem faz a economia local acontecer.
                </h2>
              </div>
              {/* <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                O monitoraME conecta a necessidade de transparência da gestão
                pública à camada de crescimento dos pequenos negócios. Menos tempo
                interpretando bases; mais clareza para agir.
              </p> */}
            </div>
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {audiences.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  data-reveal-item
                  className="group border border-border/80 bg-card p-7 shadow-[0_12px_35px_-30px_rgb(0_20_41/30%)] sm:p-8"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section data-reveal-section className="overflow-hidden bg-landing-ink py-20 text-white lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div data-reveal-item>
              <h2 className="mt-4 text-3xl font-bold leading-[1.04] text-white sm:text-5xl">
                Enxergue o movimento das compras públicas.
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
                Acompanhe a evolução das compras, compare a participação das
                microempresas e investigue fornecedores sem navegar por planilhas
                dispersas.
              </p>
              
              <Button
                asChild
                className="mt-8 rounded-full bg-landing-blue px-6 text-white hover:bg-landing-blue/80"
              >
                <Link href="/analitico">
                  Acessar compras públicas <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div data-reveal-item className="relative">
              {/* <div className="absolute -left-5 -top-5 hidden border border-white/15 bg-white/8 px-5 py-3 backdrop-blur-sm sm:block">
                <span className="block font-mono text-[9px] uppercase tracking-[0.15em] text-white/50">
                  Leitura territorial
                </span>
                <span className="mt-1 block text-sm font-semibold">
                  Dados que explicam o cenário
                </span>
              </div> */}
              <div className="overflow-hidden rounded-xl border border-white/15 bg-white shadow-2xl shadow-black/35">
                <Image
                  data-parallax
                  src="/project/Analytics.png"
                  alt="Painel analítico do monitoraME com evolução de compras públicas e participação de microempresas"
                  width={1599}
                  height={602}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="h-auto w-full"
                />
              </div>
              <div className="absolute -bottom-6 right-5 hidden items-center gap-3 bg-landing-blue px-5 py-4 text-white shadow-xl sm:flex">
                <BarChart3 className="size-5" />
                <span className="text-xs font-semibold">
                  Indicadores claros e comparáveis
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="oportunidades"
          data-reveal-section
          className="scroll-mt-20 overflow-hidden bg-landing-paper py-24 lg:py-32"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-24">
            <div>
              <h2 data-reveal-item className="mt-5 max-w-3xl text-3xl font-bold leading-[1.04] sm:text-5xl">
                Encontre compras públicas compatíveis com seu negócio.
              </h2>
              <p data-reveal-item className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
                Em vez de procurar edital por edital em diferentes portais, consulte
                oportunidades em uma experiência única, compare informações essenciais
                e concentre sua atenção no que tem mais potencial para a sua empresa.
              </p>

              <div data-reveal-item className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="h-12 rounded-full px-6">
                  <Link href="/oportunidades">
                    Acessar oportunidades públicas <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:pt-10">
              {opportunityBenefits.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  data-reveal-item
                  className="flex gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-[0_12px_35px_-30px_rgb(0_20_41/30%)] sm:p-6"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{title}</h3>
                    <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="solucoes"
          data-reveal-section
          className="scroll-mt-20 bg-landing-tint py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div data-reveal-item className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.05] sm:text-5xl">
                  Do orçamento público à oportunidade local.
                </h2>
              </div>
              <Link
                href="/analitico"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Explorar todas as análises <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {modules.map(({ title, description, icon: Icon, tone }, index) => (
                <article
                  key={title}
                  data-reveal-item
                  className={`group relative min-h-80 overflow-hidden p-8 transition-transform duration-300 hover:-translate-y-1 sm:p-10 ${tone === 'dark'
                      ? 'bg-landing-ink text-white'
                      : tone === 'blue'
                        ? 'bg-landing-blue text-white'
                        : 'border border-border/80 bg-card text-foreground shadow-[0_12px_35px_-30px_rgb(0_20_41/35%)]'
                    }`}
                >
                  <span
                    className={`metric absolute right-6 top-4 text-7xl font-semibold ${tone === 'light' ? 'text-primary/7' : 'text-white/7'
                      }`}
                  >
                    0{index + 1}
                  </span>
                  <div
                    className={`flex size-12 items-center justify-center rounded-full ${tone === 'light'
                        ? 'bg-secondary text-primary'
                        : 'bg-white/12 text-white'
                      }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-16 max-w-md text-2xl font-bold">{title}</h3>
                  <p
                    className={`mt-4 max-w-lg text-sm leading-6 ${tone === 'light'
                        ? 'text-muted-foreground'
                        : 'text-white/68'
                      }`}
                  >
                    {description}
                  </p>
                  <Link
                    href={title === 'Radar de oportunidades MPE' ? '/oportunidades' : '/analitico'}
                    className="absolute bottom-8 left-8 inline-flex items-center gap-2 text-xs font-semibold sm:left-10"
                  >
                    {title === 'Radar de oportunidades MPE'
                      ? 'Ver oportunidades públicas'
                      : 'Ver no painel'}{' '}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="metodologia"
          data-reveal-section
          className="scroll-mt-20 border-y border-border bg-landing-paper py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
              <div data-reveal-item>
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-white">
                  <DatabaseZap className="size-5" />
                </span>
                <h2 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl">
                  Simplicidade na sua tela.
                </h2>
                <p className="mt-6 text-sm leading-7 text-muted-foreground">
                  Nossa metodologia organiza o caminho do dado para que você possa se
                  concentrar no que importa: compreender e agir.
                </p>
              </div>
              <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
                {processSteps.map(([number, title, description]) => (
                  <article key={number} data-reveal-item className="min-h-56 bg-card p-7 sm:p-8">
                    <span className="metric text-sm font-semibold text-primary">
                      {number}
                    </span>
                    <h3 className="mt-10 text-xl font-bold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          data-faq-section
          data-reveal-section
          className="flex min-h-svh scroll-mt-20 items-center overflow-hidden bg-landing-tint px-5 py-16 sm:px-8 lg:py-20"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-24">
            <div data-reveal-item>
              <p className="eyebrow text-primary">Perguntas frequentes</p>
              <h2 className="mt-4 text-3xl font-bold leading-[1.05] sm:text-5xl">
                Clareza antes de começar.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                Entenda como os dados são organizados, quais cuidados considerar e
                como o monitoraME pode apoiar sua rotina.
              </p>
              <p className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <ArrowDownRight className="size-4 text-primary" />
                Continue rolando para explorar
              </p>
              <Button asChild variant="outline" className="mt-8 rounded-full px-6">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Ainda tenho uma dúvida <MessageCircle className="size-4" />
                </a>
              </Button>
            </div>

            <div data-reveal-item className="relative min-h-0">
              <div
                data-faq-viewport
                className="h-[min(68svh,42rem)] overflow-hidden border-y border-border pr-2 sm:pr-5"
              >
                <div data-faq-track>
                  {faqs.map(({ question, answer }, index) => (
                    <details
                      key={question}
                      className="group border-b border-border last:border-b-0"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left marker:content-none sm:py-7 [&::-webkit-details-marker]:hidden">
                        <span className="flex gap-4">
                          <span className="mt-1 font-mono text-[10px] font-semibold text-primary">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-base font-semibold leading-6 sm:text-lg">
                            {question}
                          </span>
                        </span>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-transform duration-300 group-open:rotate-180">
                          <ChevronDown className="size-4" />
                        </span>
                      </summary>
                      <div className="overflow-hidden">
                        <p className="max-w-3xl pb-7 pl-10 pr-12 text-sm leading-7 text-muted-foreground sm:text-base">
                          {answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-landing-tint to-transparent" />
            </div>
          </div>
        </section>

        <section
          id="contato"
          data-reveal-section
          className="scroll-mt-20 bg-landing-paper px-5 py-24 sm:px-8 lg:py-32"
        >
          <div data-reveal-item className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl bg-landing-blue text-white lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-8 sm:p-12 lg:p-16">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                <Sparkles className="size-4" />
                Próximo passo
              </div>
              <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-[1.03] text-white sm:text-5xl">
                Use dados públicos para abrir novas possibilidades.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/70">
                Explore o painel gratuitamente ou converse com nossa equipe para
                entender como o monitoraME pode apoiar sua empresa ou município.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-card px-6 text-foreground hover:bg-card/88 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80"
                >
                  <Link href="/register">
                    Criar minha conta <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" />
                    Falar com a equipe
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative hidden min-h-96 overflow-hidden bg-landing-ink lg:block">
              <Image
                src="/landing/hero-david.webp"
                alt="Equipe trabalhando com dados públicos"
                fill
                sizes="36vw"
                className="scale-110 object-cover object-[78%_center] opacity-80"
                data-parallax
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--landing-blue),transparent_55%)]" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-landing-ink text-white">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 lg:pt-16">
          <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1fr]">
            <div className="max-w-sm">
              <Link
                href="/"
                aria-label="MonitoraME — página inicial"
                className="inline-block text-white"
              >
                <Logo className="h-6 w-auto" />
              </Link>
              <p className="mt-5 text-sm leading-6 text-white/58">
                Inteligência de dados para compras públicas mais transparentes,
                estratégicas e acessíveis.
              </p>
            </div>
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
                Institucional
              </h2>
              <nav
                aria-label="Links institucionais"
                className="mt-5 flex flex-col items-start gap-3 text-xs text-white/65"
              >
                <Link href="#plataforma" className="hover:text-white">
                  Plataforma
                </Link>
                <Link href="#metodologia" className="hover:text-white">
                  Metodologia
                </Link>
                <Link href="#faq" className="hover:text-white">
                  Perguntas frequentes
                </Link>
                <Link href="#contato" className="hover:text-white">
                  Contato
                </Link>
              </nav>
            </div>
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
                Acessar
              </h2>
              <nav
                aria-label="Links da plataforma"
                className="mt-5 flex flex-col items-start gap-3 text-xs text-white/65"
              >
                <Link href="/oportunidades" className="hover:text-white">
                  Oportunidades públicas
                </Link>
                <Link href="/analitico" className="hover:text-white">
                  Painel analítico
                </Link>
                <Link href="/login" className="hover:text-white">
                  Entrar
                </Link>
                <Link href="/register" className="hover:text-white">
                  Criar conta
                </Link>
              </nav>
            </div>
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
                Fontes públicas
              </h2>
              <div className="mt-5 flex flex-col items-start gap-3 text-xs text-white/65">
                <a
                  href="https://www.tce.ce.gov.br/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  TCE Ceará
                </a>
                <a
                  href="https://pncp.gov.br/app/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  PNCP
                </a>
                <a
                  href="https://www.gov.br/receitafederal/pt-br"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Receita Federal
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-7 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 MonitoraME. Todos os direitos reservados.</span>
            <div className="flex items-center gap-5">
              <LogoIcon className="h-4 w-auto text-white/30" />
              <span>Ceará, Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
