import { Opportunity } from './types';

export const opportunitiesMock: Opportunity[] = [
  {
    id: '1',
    organization: 'Consórcio de Saúde Camocim',
    title: 'Pregão Eletrônico para fornecimento de insumos hospitalares',
    description:
      'Registro de Preços para futuro e eventual fornecimento continuado de insumos de enfermagem, materiais descartáveis e EPIs hospitalares.',
    modality: 'Pregão SRP',
    estimatedValue: 218420,
    openingDate: '2026-11-14T09:00:00',
    city: 'Camocim',
    state: 'CE',
    source: 'PNCP',
    officialUrl: 'https://www.gov.br/pncp/',
  },
  {
    id: '2',
    organization: 'Prefeitura Municipal de Sobral',
    title: 'Aquisição de equipamentos de tecnologia',
    description:
      'Aquisição de equipamentos de informática para modernização da infraestrutura administrativa municipal.',
    modality: 'Pregão Eletrônico',
    estimatedValue: 485000,
    openingDate: '2026-11-20T10:00:00',
    city: 'Sobral',
    state: 'CE',
    source: 'PNCP',
    officialUrl: 'https://www.gov.br/pncp/',
  },
];