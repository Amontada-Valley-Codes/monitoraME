'use client';

import { Database, Building2, MapPin, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '../components/page-header';
import { CATEGORIES } from '../data/fixtures';

export default function Methodology() {
  return (
    <>
      <PageHeader
        eyebrow="Transparência dos indicadores"
        title="Metodologia e fontes"
        description="Entenda o que os números representam, seus recortes e suas limitações."
      />
      <div className="mb-6 grid gap-5 md:grid-cols-3">
        {[
          {
            title: 'TCE-CE / SIM',
            text: 'Notas de empenho e natureza da despesa remetidas pelos municípios.',
            icon: Database,
            href: 'https://api-dados-abertos.tce.ce.gov.br/sim/',
          },
          {
            title: 'Receita Federal e Simples',
            text: 'Porte declarado, identificação de MEI e localização do estabelecimento.',
            icon: Building2,
            href: 'https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj',
          },
          {
            title: 'IBGE',
            text: 'Códigos e referências territoriais dos municípios brasileiros.',
            icon: MapPin,
            href: 'https://www.ibge.gov.br/',
          },
        ].map((f) => (
          <section key={f.title} className="panel p-6">
            <f.icon className="size-6 text-primary" />
            <h2 className="mt-5 font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.text}
            </p>
            <Button variant="link" className="mt-3 px-0">
              <a href={f.href} target="_blank" rel="noreferrer">
                Consultar fonte
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </section>
        ))}
      </div>
      <section className="panel mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">Como calculamos</h2>
        <Accordion type="multiple" defaultValue={['base', 'mpe']}>
          <AccordionItem value="base">
            <AccordionTrigger>Qual é a base dos indicadores?</AccordionTrigger>
            <AccordionContent>
              O total das compras consideradas corresponde ao valor empenhado
              líquido nas sete naturezas abaixo. Na demonstração: valor bruto
              menos anulações. Empenho não é pagamento, liquidação ou
              comprovação de entrega. Registros sem classificação permanecem no
              denominador.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="mpe">
            <AccordionTrigger>Como ME e MEI são apresentados?</AccordionTrigger>
            <AccordionContent>
              O indicador de capa apresenta somente microempresas. MEI aparece
              separadamente e depende da informação do Simples Nacional. Quando
              a fonte não permitir separar MEI, a apresentação deve informar
              “Microempresa (inclui MEI)”. Todos os dados desta amostra possuem
              MEI discriminado.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="territory">
            <AccordionTrigger>
              O que são compras locais e evasão municipal?
            </AccordionTrigger>
            <AccordionContent>
              A origem compara o código IBGE e a UF do estabelecimento
              fornecedor com o município comprador. Existem quatro grupos: no
              próprio município, outro município do mesmo estado, fora do estado
              e não identificado. Evasão municipal = (outro município do estado +
              fora do estado) ÷ total considerado. A origem desconhecida fica
              separada e no denominador. No panorama estadual, “local” continua
              sendo relativo a cada município comprador.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cross">
            <AccordionTrigger>
              Por que porte e origem são eixos separados?
            </AccordionTrigger>
            <AccordionContent>
              Uma empresa pode ser pequena e externa, ou grande e local. ME
              local é o cruzamento real de porte e origem, nunca uma
              multiplicação das participações. Ao filtrar origem, os indicadores
              geográficos ficam ocultos para evitar resultados tautológicos de
              100%.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="history">
            <AccordionTrigger>O porte é o da época da compra?</AccordionTrigger>
            <AccordionContent>
              Quando existe histórico, usa-se a classificação vigente na data do
              empenho. Sem histórico, usa-se o retrato cadastral atual e isso é
              sinalizado no registro. Nesta amostra, 2024 usa retrato atual e
              2025–2026 usam histórico simulado. Situação cadastral é a da
              referência mais recente.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="comparisons">
            <AccordionTrigger>
              Como interpretar variações e metas?
            </AccordionTrigger>
            <AccordionContent>
              Cards mostram variação relativa em relação ao mesmo intervalo do
              ano anterior. No comparador, diferenças entre participações são
              exibidas em pontos percentuais. Metas são objetivos de gestão
              definidos por município e exercício; não são apresentadas como
              obrigação legal. Sem base anterior, a variação não é calculada.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="demo">
            <AccordionTrigger>
              Quais são os limites desta demonstração?
            </AccordionTrigger>
            <AccordionContent>
              Dados, CNPJs e empresas são fictícios. Há 19 municípios com
              registros de janeiro de 2024 a agosto de 2026; Carnaubal demonstra
              ausência de dados. Não existe consulta ao TCE ou à Receita em
              tempo real. Metas e configurações de relatórios ficam neste
              navegador. A autorização real deverá ocorrer no backend; monitor e
              admin usam a mesma configuração de permissões.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <section className="panel overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Naturezas consideradas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O recorte é definido pelo código da natureza, sem dedução por
            atividade econômica.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CATEGORIES.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="data-value text-sm">{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}