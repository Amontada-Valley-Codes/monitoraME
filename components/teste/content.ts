export const testeContent = {
  // notice: "Página de demonstração · conteúdo provisório",
  nav: [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Soluções", href: "#solucoes", dropdown: true },
    { label: "Contato", href: "#contato" },
    { label: "Explorar", href: "#resultados", dropdown: true },
  ],
  headerCta: "Começar agora",
  hero: {
    // eyebrow: "INTELIGÊNCIA  NEGÓCIOS",
    title: "Seu negócio pode ir mais longe com dados públicos.",
    description: "Descubra oportunidades de compras públicas e entenda o mercado da sua região em um só lugar.",
    cta: "Explorar oportunidades",
    play: "Conhecer a plataforma",
    leftCard: { value: "4.310", label: "oportunidades*" },
    topCard: { value: "9.702", label: "negócios*" },
    chartLabel: "Visão de mercado*",
  },
  social: {
    // title: "Conectando quem faz o Ceará acontecer",
    logos: ["NEGÓCIOS", "PREFEITURAS", "DADOS", "OPORTUNIDADES", "TERRITÓRIOS", "CONEXÕES"],
    municipality: {
      label: "Município do Ceará",
      placeholder: "Selecione um município",
      searchPlaceholder: "Pesquisar por nome ou código...",
      empty: "Município não encontrado.",
      group: "Municípios do Ceará",
      submit: "Ver dados do município",
      error: "Selecione um município válido do Ceará.",
    },
  },
  about: {
    eyebrow: "QUEM SOMOS",
    title: "Dados claros. Decisões melhores.",
    description: "O MonitoraME aproxima pequenos negócios das informações que ajudam a encontrar caminhos no mercado público.",
    sealValue: "25+",
    sealLabel: "indicadores*",
    items: [
      { title: "Compras públicas", description: "Explore editais e acompanhe oportunidades com mais contexto." },
      { title: "Inteligência territorial", description: "Observe tendências e conheça melhor sua região." },
    ],
  },
  services: {
    eyebrow: "SOLUÇÕES EM DESTAQUE",
    title: "Mais clareza para descobrir novos caminhos",
    items: [
      { title: "Oportunidades", description: "Encontre editais e veja informações relevantes para o seu negócio.", icon: "search" },
      { title: "Análise regional", description: "Explore dados de compras públicas por município e território.", icon: "chart" },
      { title: "Comparativos", description: "Visualize recortes e acompanhe mudanças ao longo do tempo.", icon: "layers" },
      { title: "Acompanhamento", description: "Organize descobertas e mantenha oportunidades à vista.", icon: "users" },
    ],
  },
  results: {
    title: "Vamos construir pontes entre dados e oportunidades.",
    description: "Informação acessível para quem quer entender o mercado público e fazer escolhas mais bem informadas.",
    metrics: [
      { value: "18K+", label: "REGISTROS*" },
      { value: "7K+", label: "OPORTUNIDADES*" },
      { value: "4,7", label: "INDICADOR*" },
    ],
  },
  footer: {
    // tagline: "Dados públicos para novas possibilidades.",
    groups: [
      { title: "Plataforma", links: [{ label: "Início", href: "#inicio" }, { label: "Soluções", href: "#solucoes" }] },
      { title: "Conheça", links: [{ label: "Sobre", href: "#sobre" }, { label: "Resultados", href: "#resultados" }] },
      { title: "Contato", links: [{ label: "Fale conosco", href: "#contato" }, { label: "Voltar ao topo", href: "#inicio" }] },
    ],
    copyright: "© MonitoraME. Página conceitual de demonstração.",
    social: [{ label: "LinkedIn", glyph: "in" }, { label: "Instagram", glyph: "◎" }, { label: "YouTube", glyph: "▷" }],
  },
} as const;
