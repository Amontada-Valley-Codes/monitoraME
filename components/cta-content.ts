export type CtaContent = {
  title: string;
  description: string;
  preview: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  offer: {
    title: string;
    badge: string;
    description: string;
    primaryAction: {
      label: string;
      href: string;
    };
    secondaryAction?: {
      prefix: string;
      label: string;
      href: string;
    };
    benefits: string[];
  };
  footer: string;
  closeLabel: string;
};

export const CTA_CONTENT: Record<'createAccount' | 'choosePlan', CtaContent> = {
  createAccount: {
    title: 'Crie sua conta gratuitamente e desbloqueie a visualização de dados municipais',
    description:
      'Crie sua conta para começar a explorar o MonitoraME e conhecer recursos avançados para acompanhar e gerenciar sua equipe.',
    preview: {
      title: 'Visualização de dados municipais',
      description: 'Acompanhe licitações e contratos com informações claras e acessíveis.',
      image: '/project/Analytics.png',
      imageAlt: 'Visualização de dados municipais do MonitoraME',
    },
    offer: {
      title: 'Conheça o MonitoraME',
      badge: 'Gratuito',
      description: 'Tenha acesso a informações públicas de forma simples, organizada e transparente.',
      primaryAction: {
        label: 'Criar conta',
        href: '/register',
      },
      secondaryAction: {
        prefix: 'Já possui uma conta?',
        label: 'Entrar',
        href: '/login',
      },
      benefits: [
        'Compare resultados entre municípios e períodos.',
        'Explore despesas e rubricas em detalhes.',
        'Exporte recortes em PDF, CSV e Excel.',
      ],
    },
    footer: 'Comece gratuitamente e explore as informações disponíveis no MonitoraME.',
    closeLabel: 'Fechar',
  },
  choosePlan: {
    title: 'Escolha um plano para liberar todos os recursos do MonitoraME',
    description:
      'Sua conta já está pronta. Assine o plano que melhor atende sua rotina para exportar dados e acessar recursos avançados.',
    preview: {
      title: 'Análises completas para sua gestão',
      description: 'Transforme informações públicas em relatórios prontos para apoiar suas decisões.',
      image: '/project/Analytics.png',
      imageAlt: 'Painel analítico disponível nos planos do MonitoraME',
    },
    offer: {
      title: 'Planos MonitoraME',
      badge: 'A partir de R$ 49',
      description: 'Compare as opções e escolha os recursos ideais para sua equipe.',
      primaryAction: {
        label: 'Assinar',
        href: '/analitico/planos',
      },
      benefits: [
        'Exporte relatórios em PDF, CSV e Excel.',
        'Compare resultados entre municípios.',
        'Explore despesas, rubricas e análises territoriais.',
        'Receba alertas e use o matching avançado de oportunidades.',
      ],
    },
    footer: 'Você pode comparar os planos antes de iniciar sua assinatura.',
    closeLabel: 'Fechar',
  },
};
