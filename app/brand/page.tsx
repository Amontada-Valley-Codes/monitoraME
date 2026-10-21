import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Identidade visual | MonitoraME' };

const variants = [
  { title: 'Horizontal · claro', file: 'horizontal-light.svg', dark: false },
  { title: 'Horizontal · escuro', file: 'horizontal-dark.svg', dark: true },
  { title: 'Empilhada · claro', file: 'stacked-light.svg', dark: false },
  { title: 'Empilhada · escuro', file: 'stacked-dark.svg', dark: true },
  { title: 'Ícone de aplicativo', file: 'icon-app.svg', dark: false },
  { title: 'M independente', file: 'icon-m.svg', dark: false },
  { title: 'Monocromática · preta', file: 'wordmark-black.svg', dark: false },
  { title: 'Monocromática · branca', file: 'wordmark-white.svg', dark: true },
] as const;

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-5 py-16 text-[#171717] dark:bg-[#111315] dark:text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[.3em] text-[#2058B7]">MonitoraME</p>
        <h1 className="mt-3 text-4xl font-bold">Identidade visual</h1>
        <p className="mt-4 max-w-2xl text-sm opacity-70">Arquivos SVG com fundo transparente. Azul #2058B7, texto #171717 ou #FFFFFF. As cores podem ser ajustadas pelas variáveis CSS --brand-blue, --brand-ink e --brand-cutout quando o SVG for incorporado ao documento.</p>
        <div className="mt-10 grid gap-x-12 gap-y-14 md:grid-cols-2">
          {variants.map(({ title, file, dark }) => (
            <section key={file} className="min-w-0">
              <div className={`flex h-36 items-center justify-start px-5 ${dark ? 'bg-[#111315]' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/brand/${file}`} alt={`Logo MonitoraME, ${title.toLowerCase()}`} className="max-h-24 max-w-full object-contain object-left" />
              </div>
              <div className="flex items-center justify-between gap-4 px-5 pt-2 text-sm">
                <h2 className="font-semibold">{title}</h2>
                <a className="font-medium text-[#2058B7] underline underline-offset-4 dark:text-[#80aaff]" href={`/brand/${file}`} download={file}>Baixar SVG</a>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
