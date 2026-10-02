import Link from 'next/link';
import { Opportunity } from '../types';

type OpportunityDetailsProps = {
  opportunity: Opportunity;
};

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1340px]">
        {/* COLUNA ESQUERDA */}
        <aside className="hidden w-[275px] shrink-0 border-r border-slate-200 bg-white xl:flex xl:h-screen xl:flex-col xl:justify-between xl:sticky xl:top-0 xl:px-4 xl:py-4">
          <div>
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>

              <span className="text-xl font-bold tracking-tight text-slate-900">
                Monitora<span className="text-blue-600">ME</span>
              </span>
            </div>

            <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Oportunidades
            </div>

            <nav className="mt-2 space-y-1">
              <Link
                href="/oportunidades"
                className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-sm font-semibold text-blue-700"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>

                  <span>Editais Abertos</span>
                </div>

                <span className="h-4 w-1.5 rounded-full bg-blue-600" />
              </Link>

              <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>

                <span>Editais Salvos</span>
              </button>
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gestão & Inteligência
              </div>

              <nav className="mt-2 space-y-1">
                <button className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>

                    <span>Área da Empresa</span>
                  </div>

                  <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    PRO
                  </span>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  <svg
                    className="h-5 w-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                  </svg>

                  <span>Perfil Fornecedor</span>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>

                  <span>Mais opções</span>
                </button>
              </nav>
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              Filtrar Oportunidades
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                SN

                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">
                  Soluções Nordeste
                </p>

                <p className="truncate text-[10px] text-slate-400">
                  34.819.•••/0001-92
                </p>
              </div>

              <span className="text-slate-400">•••</span>
            </div>
          </div>
        </aside>

        {/* COLUNA CENTRAL */}
        <main className="w-full min-w-0 max-w-[680px] border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Link
                  href="/oportunidades"
                  className="mt-1 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  ←
                </Link>

                <div>
                  <p className="text-sm text-slate-600">
                    Edital Detalhado
                  </p>

                  <h1 className="text-lg font-semibold text-slate-900">
                    PE SRP nº 2024/014 · {opportunity.city},{' '}
                    {opportunity.state}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Compartilhar"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                  CPS
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900">
                      {opportunity.organization}
                    </h2>

                    <span className="text-blue-500">✓</span>
                  </div>

                  <p className="text-sm text-blue-600">
                    @cpsmcamocim
                    <span className="text-slate-400">
                      {' '}
                      · Ceará · Região Norte
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">
                  ID PNCP: 07.598.634/0001-37
                </span>

                <h3 className="mt-4 text-lg font-bold leading-relaxed text-slate-900">
                  Registro de Preços para aquisição de insumos hospitalares,
                  seringas descartáveis, luvas de procedimento, álcool em gel
                  70% e cateteres para policlínicas e CEOs regionais.
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Atendimento continuado dos municípios consorciados de Camocim,
                  Granja, Chaval e Barroquinha.
                </p>
              </div>

              <div className="mt-5 grid gap-4 border-y border-slate-100 py-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs font-bold uppercase text-blue-600">
                    Valor Estimado
                  </span>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formattedValue}
                  </p>
                </div>

                <div className="border-slate-100 sm:border-x sm:px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-emerald-600">
                      Cota MPE
                    </span>

                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      25%
                    </span>
                  </div>

                  <p className="mt-1 text-xl font-bold text-emerald-700">
                    R$ 54.605,00
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-orange-600">
                    Abertura Sessão
                  </span>

                  <p className="mt-1 font-bold text-slate-900">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Modalidade
                  </span>

                  <p className="mt-1 text-sm font-semibold">
                    {opportunity.modality}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Critério
                  </span>

                  <p className="mt-1 text-sm font-semibold">
                    Menor Preço Item
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Disputa
                  </span>

                  <p className="mt-1 text-sm font-semibold">
                    Aberto / Fechado
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Localização
                  </span>

                  <p className="mt-1 text-sm font-semibold">
                    {opportunity.city} / {opportunity.state}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                {opportunity.officialUrl && (
                  <a
                    href={opportunity.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    ↗ Acessar Edital no PNCP
                  </a>
                )}

                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  ♧ Salvar Certame
                </button>
              </div>
            </div>

            {/* ITENS / ANEXOS */}
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid grid-cols-2 bg-slate-100 p-1">
                <button className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm">
                  ▣ Itens (04)
                </button>

                <button className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-600">
                  ▱ Anexos (04)
                </button>
              </div>

              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Arquivos Oficiais para Download
                  </p>

                  <span className="text-xs text-slate-400">
                    ICP-Brasil
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                      PDF
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        Edital_PE_014_2024.pdf
                      </p>

                      <p className="text-xs text-slate-400">
                        2.4 MB · 01/11
                      </p>
                    </div>

                    <span className="text-slate-400">↓</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                      TR
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        Termo_Referencia_Anexo_I.pdf
                      </p>

                      <p className="text-xs text-slate-400">
                        1.1 MB · Especificações
                      </p>
                    </div>

                    <span className="text-slate-400">↓</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">
                      XLS
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        Planilha_Orcamentaria.xlsx
                      </p>

                      <p className="text-xs text-slate-400">
                        420 KB · Matriz Custo
                      </p>
                    </div>

                    <span className="text-slate-400">↓</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                      DOC
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        Minuta_Contrato_Ata.pdf
                      </p>

                      <p className="text-xs text-slate-400">
                        890 KB · Cláusulas
                      </p>
                    </div>

                    <span className="text-slate-400">↓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PREGOEIRO */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  ♙
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Pregoeiro: Carlos Eduardo Lima
                  </p>

                  <p className="text-xs text-slate-400">
                    Portaria CPS nº 042/2024
                  </p>
                </div>
              </div>

              <p className="text-sm text-blue-600">
                ✉ licitacao@consorciocamocim.ce.gov.br
              </p>
            </div>
          </div>
        </main>

        {/* COLUNA DIREITA */}
        <aside className="hidden flex-1 bg-slate-50 p-4 lg:block">
          <div className="sticky top-4">
            <div className="relative mb-4">
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                type="text"
                placeholder="Buscar órgãos, atas e certames..."
                className="w-full rounded-full border-none bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Comunicados Oficiais
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    5 registros oficiais do Pregoeiro e CPL
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                  HOJE 11:20
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 border-b border-slate-100 pb-3 text-xs font-semibold text-slate-600">
                <span>Todas (5)</span>
                <span>Avisos (2)</span>
                <span>Impugnações (1)</span>
                <span>Esclarecimentos (2)</span>
              </div>

              <div className="mt-4 space-y-5">
                <div className="border-l-4 border-blue-500 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">
                      URGENTE / RETIFICAÇÃO
                    </span>

                    <span className="text-[10px] text-slate-400">
                      Há 2h
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    Retificação do Termo de Referência nº 01
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Ajuste técnico na especificação do item 01
                    (Seringas Luer-Lock). Data e horário de abertura
                    mantidos inalterados.
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Dr. Carlos Eduardo · Pregoeiro</span>
                    <span>PDF (320 KB)</span>
                  </div>
                </div>

                <div className="border-l-4 border-orange-500 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-600">
                      IMPUGNAÇÃO Nº 01
                    </span>

                    <span className="text-[10px] text-slate-400">
                      04/11
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    Julgamento de Impugnação · Qualificação Técnica
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Contestação referente à qualificação econômico-financeira
                    mínima exigida no item 10.2. Decisão mantida com parecer
                    jurídico referendado.
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Assessoria Jurídica / Pregoeiro</span>
                    <span>Parecer (540 KB)</span>
                  </div>
                </div>

                <div className="pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      ESCLARECIMENTO Nº 01
                    </span>

                    <span className="text-[10px] text-slate-400">
                      Ontem
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    Atestados de Cooperativas Médicas
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Confirmada aceitação de atestados de capacidade emitidos
                    por cooperativas médicas privadas devidamente registradas.
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Resp.: Gestor de Saúde do Consórcio</span>

                    <span className="font-semibold text-emerald-600">
                      Deferido
                    </span>
                  </div>
                </div>

                <div className="pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      ESCLARECIMENTO Nº 02
                    </span>

                    <span className="text-[10px] text-slate-400">
                      02/11
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    Prazos de Entrega e Logística Regional
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Detalhamento dos cronogramas para remessas fracionadas
                    diretas às policlínicas e CEOs de Camocim, Granja e
                    Barroquinha.
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Coord. de Logística e Farmácia</span>
                    <span>Nota Técnica</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}