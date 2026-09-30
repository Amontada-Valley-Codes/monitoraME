export type CheckoutPlan = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  billingPeriod: 'mês';
  features: string[];
  badge?: string;
  originalPriceInCents?: number;
  featured?: boolean;
};

export const CHECKOUT_PLANS: CheckoutPlan[] = [
  {
    id: 'Básico',
    name: 'Básico',
    description: 'Para quem está começando a transformar dados públicos em decisões.',
    priceInCents: 4900,
    billingPeriod: 'mês',
    features: [
      'Painel analítico completo',
      'Filtros por município e período',
      'Exportação de relatórios',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'Empresarial',
    name: 'Empresarial',
    description: 'Governança e acompanhamento ampliado para estruturas maiores.',
    priceInCents: 19900,
    billingPeriod: 'mês',
    badge: 'Mais escolhido',
    featured: true,
    features: [
      'Tudo do plano Profissional',
      'Acesso para toda a equipe',
      'Indicadores personalizados',
      'Histórico e trilha de auditoria',
      'Atendimento dedicado',
    ],
  },
  {
    id: 'Profissional',
    name: 'Profissional',
    description: 'Mais recursos para equipes que monitoram resultados todos os dias.',
    priceInCents: 9900,
    originalPriceInCents: 12900,
    billingPeriod: 'mês',
    features: [
      'Tudo do plano Básico',
      'Comparação entre municípios',
      'Metas e alertas personalizados',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
  },
];

export function formatPlanPrice(valueInCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100);
}
