# Design system do MonitoraME

Este documento descreve as fundações visuais, os tokens e as convenções para
construir interfaces consistentes no MonitoraME.

## Objetivo

O design system centraliza as decisões de aparência e comportamento que devem
ser compartilhadas entre telas: cores, tipografia, espaçamento, superfícies,
componentes, estados e suporte a tema claro/escuro.

A implementação usa:

- Tailwind CSS v4;
- componentes `shadcn/ui` com estilo `base-nova`;
- Base UI e Radix como primitivas;
- CVA (`class-variance-authority`) para variantes;
- Lucide para ícones;
- `next-themes` para o tema.

As configurações do shadcn estão em `components.json`. Os tokens ficam em
`shared/styles/tokens.css` e são disponibilizados ao Tailwind em
`app/globals.css`.

## Princípios de uso

1. Use tokens semânticos, não valores hexadecimais ou cores de escala, nas
   novas interfaces.
2. Prefira componentes de `@/components/ui` aos elementos estilizados
   diretamente na tela.
3. Preserve contraste, foco visível, estados inválidos e estados desabilitados.
4. Toda interface nova deve funcionar nos temas claro e escuro.
5. Use os tokens de domínio apenas quando o significado visual estiver ligado
   ao dado representado, como origem, porte ou série de gráfico.

## Tema

O tema é aplicado pela classe `dark` no documento. A aplicação inicia em
`system`, respeita a preferência do sistema operacional e pode ser alternada
pela interface.

Os valores claros estão em `:root`; os escuros, em `.dark`. Não use
`dark:` para duplicar uma cor semântica que já possui token próprio: `bg-card`,
`text-foreground` e `border-border`, por exemplo, acompanham o tema sozinhos.

## Cores semânticas

| Finalidade | Tokens Tailwind | Uso |
| --- | --- | --- |
| Fundo da página | `bg-background`, `text-foreground` | Estrutura principal da tela |
| Superfícies | `bg-card`, `text-card-foreground` | Cards, painéis e blocos de conteúdo |
| Camadas flutuantes | `bg-popover`, `text-popover-foreground` | Menus, tooltips e popovers |
| Ação principal | `bg-primary`, `text-primary-foreground` | Ações primárias e seleção |
| Ação secundária | `bg-secondary`, `text-secondary-foreground` | Ações secundárias e estados leves |
| Conteúdo discreto | `bg-muted`, `text-muted-foreground` | Metadados, placeholders e áreas de apoio |
| Destaque interativo | `bg-accent`, `text-accent-foreground` | Hover, itens ativos e navegação |
| Erro | `text-destructive` | Erros e ações destrutivas |
| Êxito | `text-success`, `bg-success-soft` | Confirmações e estados positivos |
| Atenção | `text-warning`, `bg-warning-soft` | Avisos e prazos |
| Estrutura e foco | `border-border`, `border-input`, `ring-ring` | Divisórias, campos e foco visível |

Tokens exclusivos da marca e das landing pages estão disponíveis como
`brand`, `brand-ink`, `landing-ink`, `landing-blue`, `landing-paper`,
`landing-tint` e `navy`.

## Tipografia

| Papel | Família | Quando usar |
| --- | --- | --- |
| Títulos | Plus Jakarta Sans | `h1` a `h4`, títulos de seções e destaques editoriais |
| Texto | Roboto | Conteúdo geral, formulários e descrições |
| Dados | JetBrains Mono | Valores financeiros, métricas, IDs e códigos |

As fontes são locais e declaradas em `shared/styles/fonts.css`. Use as classes
ou utilitários já existentes para dados numéricos quando disponíveis, em vez
de trocar a tipografia de forma pontual.

## Espaçamento, dimensões e elevação

A unidade de espaçamento é `0.25rem`. Use a escala do Tailwind para compor
margens e espaçamentos, mantendo os seguintes tokens de layout como referência:

| Token | Valor | Uso |
| --- | --- | --- |
| `--page-padding` | `2rem` | Respiro horizontal padrão da página; reduz em telas menores |
| `--card-padding` | `1.5rem` | Conteúdo interno de cards customizados |
| `--sidebar-size` | `17rem` | Largura expandida da navegação lateral |
| `--rail-size` | `4.25rem` | Largura da navegação lateral recolhida |
| `--header-height` | `4rem` | Altura do cabeçalho da aplicação |
| `--content-max` | `100rem` | Largura máxima do conteúdo |
| `--radius-control` | `0.375rem` | Campos e controles compactos |
| `--radius` | `0.75rem` | Painéis e componentes maiores |

Use `--shadow-panel`, `--shadow-popover` e `--shadow-dialog` para as elevações
correspondentes. Diálogos, sheets, menus e popovers já recebem essas sombras
por regras globais baseadas em `data-slot`.

## Componentes reutilizáveis

Os componentes-base estão em `components/ui`. Importe-os pelo alias `@/components/ui`.

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

### Botões

`Button` oferece variantes `default`, `outline`, `secondary`, `ghost`,
`destructive` e `link`, e tamanhos textuais e de ícone. Escolha a variante pelo
significado da ação:

- `default`: ação principal da área;
- `secondary` e `outline`: ações alternativas;
- `ghost`: ação de baixo peso visual;
- `destructive`: remoção, cancelamento irreversível ou ação perigosa;
- `link`: navegação contextual em texto.

Use `aria-label` em botões compostos apenas por ícone.

### Campos e feedback

`Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup` e os demais controles
já incluem foco e estado inválido. Para erros de formulário, use o componente
`Form`/`Field` e os atributos de acessibilidade fornecidos pela implementação,
em vez de criar mensagens desconectadas do campo.

Para feedback transitório, use o `Toaster` global e as notificações Sonner.
Para confirmação de ações irreversíveis, use `AlertDialog`.

### Superfícies e navegação

Use `Card` para agrupar conteúdo relacionado. Use a família `Sidebar` para a
navegação persistente da aplicação, preservando os tokens `sidebar-*`.

Não recrie visualmente componentes de menu, diálogo, dropdown, tooltip, tabs,
table, pagination ou calendar: há componentes-base para esses padrões em
`components/ui`.

## Gráficos e visualização de dados

Use `chart-1` a `chart-5` para séries genéricas. Para gráficos de domínio, use
as famílias `expense-*`, `size-*` e `origin-*` de forma consistente:

- `expense-*`: categorias de despesa;
- `size-*`: porte empresarial;
- `origin-*`: origem territorial ou institucional do dado.

O wrapper `ChartContainer` em `components/ui/chart.tsx` permite declarar cores
por série e por tema. Eixos, grid, tooltip e marcadores devem usar os tokens
`chart-*`, não cores literais.

## Acessibilidade

- Não remova `:focus-visible`; ele usa `ring-ring` como indicador global.
- Todo controle sem rótulo visível precisa de um nome acessível.
- Não use cor como único meio de comunicar estado; inclua texto, ícone ou outro
  indicador complementar.
- Mantenha alvos de interação com pelo menos `2.75rem` quando usar os slots
  globais de botão, select e input.
- Verifique os dois temas antes de concluir uma interface.

## Convenções para novas telas

1. Comece por componentes em `components/ui`.
2. Monte a estrutura com `bg-background`, `bg-card`, `border-border` e textos
   semânticos.
3. Use `primary`, `secondary`, `accent`, `success`, `warning` e `destructive`
   conforme o significado, não conforme preferência estética.
4. Evite novas ocorrências de `slate-*`, `white`, `black` ou hexadecimais
   diretamente nas classes. Migre usos existentes gradualmente para tokens
   semânticos quando tocar naquela área.
5. Valide visualmente em tema claro, tema escuro e em larguras de tela menores.

## Fontes de verdade

- `shared/styles/tokens.css`: valores de tokens nos dois temas;
- `app/globals.css`: exposição dos tokens ao Tailwind e regras globais;
- `shared/styles/fonts.css`: fontes locais;
- `components/ui/`: componentes e variantes reutilizáveis;
- `components.json`: configuração e aliases do shadcn/ui.
