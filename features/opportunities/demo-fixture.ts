import type { PortfolioItem, PortfolioMember } from './portfolio';
import type { Opportunity } from './types';

export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';
export type NotificationItem = {
  id: string; type: string; title: string; description: string; reason: string; createdAt: string;
  severity: NotificationSeverity; priority: 'immediate' | 'grouped' | 'operational'; read: boolean;
  opportunityId?: string; opportunityTitle?: string; score?: number; confidence?: number;
  relatedCnaes?: string[]; groupCount?: number; stale?: boolean;
  destination: { kind: 'opportunity' | 'portfolio' | 'document'; href: string; label: string };
};

const opportunity = (data: Partial<Opportunity> & Pick<Opportunity, 'id' | 'organization' | 'title' | 'city' | 'matchScore' | 'confidence' | 'relatedCnaes'>): Opportunity => ({
  description: 'Contratação de solução de tecnologia para modernização dos serviços públicos.', modality: 'Pregão Eletrônico', estimatedValue: 200000,
  openingDate: '2026-11-01T09:00:00-03:00', closingDate: '2026-10-31T17:00:00-03:00', state: 'CE', source: 'PNCP', officialUrl: 'https://pncp.gov.br/app/',
  matchReasons: ['Categoria de TI aderente', 'Oportunidade no Ceará', 'Valor dentro da faixa preferida'], status: 'open', ...data,
});

export const companyDemoFixture = {
  company: { id: 'company-demo-nordeste', legalName: 'Nordeste Soluções e Suprimentos Ltda.', tradeName: 'Nordeste Conecta', cnpj: '00.000.000/0001-91', size: 'Microempresa — ME', status: 'Empresa validada e acesso ativo', plan: 'Equipe — R$ 119,99/mês', city: 'Fortaleza', state: 'CE', ibgeCode: '2304400', email: 'contato@nordeste-conecta.example', phone: '(85) 3000-0000' },
  people: [{ id: 'ana', name: 'Ana Martins', role: 'Administradora' }, { id: 'bruno', name: 'Bruno Lima', role: 'Gestor' }, { id: 'carla', name: 'Carla Souza', role: 'Colaboradora' }],
  documents: [{ id: 'certidao-federal', name: 'Certidão Federal', expiresAt: '2026-10-20', href: '/oportunidades/perfil?tab=documentos' }],
  people: [{ id: 'ana', name: 'Ana Martins', role: 'Administradora', permission: 'admin' }, { id: 'bruno', name: 'Bruno Lima', role: 'Gestor', permission: 'manager' }, { id: 'carla', name: 'Carla Souza', role: 'Colaboradora', permission: 'collaborator' }] satisfies PortfolioMember[],
  workspaceUsage: {
    savedSearches: { used: 8, limit: 30 }, activeMonitors: { used: 24, limit: 100 }, activeOpportunities: { used: 42, limit: 500 },
    documents: { used: 18, limit: 500, storageMb: 320, storageLimitMb: 5120 }, monthlyExports: { used: 12, limit: 100 },
  },
  documents: [{ id: 'certidao-federal', name: 'Certidão Federal', expiresAt: '2026-10-20', href: '/perfil?tab=documentos' }],
  opportunities: [
    opportunity({ id: 'ti-fortaleza-2026', organization: 'Prefeitura de Fortaleza', title: 'Desenvolvimento e sustentação de plataforma de serviços digitais', city: 'Fortaleza', estimatedValue: 480000, closingDate: '2026-10-21T18:00:00-03:00', matchScore: 96, confidence: 88, relatedCnaes: ['6201-5/01', '6204-0/00'], matchReasons: ['CNAE principal aderente', 'Fortaleza está na região de interesse', 'Valor dentro da faixa preferida'] }),
    opportunity({ id: 'equip-caucaia-2026', organization: 'Prefeitura de Caucaia', title: 'Aquisição de notebooks e equipamentos de rede', city: 'Caucaia', estimatedValue: 315000, closingDate: '2026-10-26T17:00:00-03:00', matchScore: 92, confidence: 79, relatedCnaes: ['4651-6/01'], matchReasons: ['CNAE de equipamentos aderente', 'Município monitorado', 'Modalidade preferida'] }),
    opportunity({ id: 'suporte-maracanau-2026', organization: 'Prefeitura de Maracanaú', title: 'Serviços continuados de suporte técnico em TI', city: 'Maracanaú', modality: 'Dispensa Eletrônica', estimatedValue: 92000, closingDate: '2026-10-23T18:00:00-03:00', matchScore: 84, confidence: 82, relatedCnaes: ['6204-0/00'], matchReasons: ['Categoria suporte técnico', 'Município monitorado'] }),
    opportunity({ id: 'consultoria-sobral-2026', organization: 'Prefeitura de Sobral', title: 'Consultoria para transformação digital', city: 'Sobral', estimatedValue: 228000, matchScore: 81, confidence: 76, relatedCnaes: ['6204-0/00'], matchReasons: ['CNAE de consultoria aderente', 'Oportunidade no Ceará'] }),
    opportunity({ id: 'rede-eusebio-2026', organization: 'Prefeitura de Eusébio', title: 'Infraestrutura de rede para escolas municipais', city: 'Eusébio', estimatedValue: 410000, matchScore: 78, confidence: 74, relatedCnaes: ['4651-6/01'], matchReasons: ['Equipamentos de informática', 'Faixa de valor aderente'] }),
    opportunity({ id: 'sistema-aquiraz-2026', organization: 'Prefeitura de Aquiraz', title: 'Licenciamento de sistema de gestão', city: 'Aquiraz', estimatedValue: 190000, matchScore: 76, confidence: 72, relatedCnaes: ['6201-5/01'], matchReasons: ['Desenvolvimento de software', 'Oportunidade no Ceará'] }),
    opportunity({ id: 'portal-pacatuba-2026', organization: 'Prefeitura de Pacatuba', title: 'Portal de transparência e ouvidoria digital', city: 'Pacatuba', estimatedValue: 135000, matchScore: 80, confidence: 75, relatedCnaes: ['6201-5/01'], matchReasons: ['Desenvolvimento de software', 'Região Metropolitana de Fortaleza'], status: 'suspended' }),
    opportunity({ id: 'servidores-legado-2026', organization: 'Prefeitura de Maranguape', title: 'Aquisição de servidores — lote legado', city: 'Maranguape', estimatedValue: 260000, matchScore: 77, confidence: 70, relatedCnaes: ['4651-6/01'], matchReasons: ['Equipamentos de informática', 'Oportunidade no Ceará'], status: 'cancelled' }),
  ] satisfies Opportunity[],
  portfolio: [
    { id: 'pf-fortaleza', opportunityId: 'ti-fortaleza-2026', stage: 'preparing', assigneeId: 'bruno', internalDeadline: '2026-10-21', archived: false, version: 4,
      note: { text: 'Confirmar com o contador a validade da Certidão Federal antes do envio. Pedir à Carla os atestados de sustentação de sistemas web.', authorId: 'bruno', updatedAt: '2026-10-14T11:30:00-03:00' }, history: [
      { id: 'pf-fortaleza-v4', at: '2026-10-14T11:30:00-03:00', authorId: 'bruno', action: 'note', from: null },
      { id: 'pf-fortaleza-v3', at: '2026-10-14T10:05:00-03:00', authorId: 'bruno', action: 'deadline', from: null, to: '2026-10-21' },
      { id: 'pf-fortaleza-v2', at: '2026-10-14T09:50:00-03:00', authorId: 'ana', action: 'stage', from: 'interested', to: 'preparing' },
      { id: 'pf-fortaleza-v1', at: '2026-10-13T16:30:00-03:00', authorId: 'ana', action: 'created', to: 'interested' },
    ] },
    { id: 'pf-caucaia', opportunityId: 'equip-caucaia-2026', stage: 'confirmed', assigneeId: 'ana', internalDeadline: '2026-10-24', archived: false, version: 2, history: [
      { id: 'pf-caucaia-v2', at: '2026-10-12T11:20:00-03:00', authorId: 'ana', action: 'stage', from: 'preparing', to: 'confirmed' },
      { id: 'pf-caucaia-v1', at: '2026-10-09T08:40:00-03:00', authorId: 'ana', action: 'created', to: 'preparing' },
    ] },
    { id: 'pf-maracanau', opportunityId: 'suporte-maracanau-2026', stage: 'analysis', assigneeId: 'carla', internalDeadline: '2026-10-22', archived: false, version: 2, history: [
      { id: 'pf-maracanau-v2', at: '2026-10-08T10:15:00-03:00', authorId: 'ana', action: 'assignee', from: null, to: 'carla' },
      { id: 'pf-maracanau-v1', at: '2026-10-08T10:10:00-03:00', authorId: 'ana', action: 'created', to: 'analysis' },
    ] },
    { id: 'pf-sobral', opportunityId: 'consultoria-sobral-2026', stage: 'awaiting', assigneeId: 'bruno', internalDeadline: null, archived: false, version: 2, history: [
      { id: 'pf-sobral-v2', at: '2026-10-05T17:00:00-03:00', authorId: 'bruno', action: 'stage', from: 'submitted', to: 'awaiting' },
      { id: 'pf-sobral-v1', at: '2026-09-28T09:00:00-03:00', authorId: 'bruno', action: 'created', to: 'submitted' },
    ] },
    { id: 'pf-pacatuba', opportunityId: 'portal-pacatuba-2026', stage: 'interested', assigneeId: 'carla', internalDeadline: '2026-10-30', archived: false, version: 1, history: [
      { id: 'pf-pacatuba-v1', at: '2026-10-10T14:00:00-03:00', authorId: 'bruno', action: 'created', to: 'interested' },
    ] },
    { id: 'pf-maranguape', opportunityId: 'servidores-legado-2026', stage: 'preparing', assigneeId: 'ana', internalDeadline: '2026-10-18', archived: false, version: 1, history: [
      { id: 'pf-maranguape-v1', at: '2026-10-02T09:30:00-03:00', authorId: 'ana', action: 'created', to: 'preparing' },
    ] },
    { id: 'pf-aquiraz', opportunityId: 'sistema-aquiraz-2026', stage: 'discarded', assigneeId: null, internalDeadline: null, archived: true, discardReason: 'Exige atestado de implantação em mais de 50 mil usuários.', version: 3, history: [
      { id: 'pf-aquiraz-v3', at: '2026-10-07T15:00:00-03:00', authorId: 'ana', action: 'archived' },
      { id: 'pf-aquiraz-v2', at: '2026-10-07T14:55:00-03:00', authorId: 'ana', action: 'stage', from: 'analysis', to: 'discarded', note: 'Exige atestado de implantação em mais de 50 mil usuários.' },
      { id: 'pf-aquiraz-v1', at: '2026-10-06T09:00:00-03:00', authorId: 'bruno', action: 'created', to: 'analysis' },
    ] },
  ] satisfies PortfolioItem[],
  notifications: [
    { id: 'n1', type: 'closing', title: 'Encerramento próximo', description: 'O envio de propostas termina amanhã, às 18h.', reason: 'Prazo oficial a menos de 48 horas', createdAt: '2026-10-14T09:35:00-03:00', severity: 'critical', priority: 'immediate', read: false, opportunityId: 'ti-fortaleza-2026', opportunityTitle: 'Plataforma de serviços digitais', destination: { kind: 'opportunity', href: '/oportunidades/ti-fortaleza-2026', label: 'Revisar oportunidade' } },
    { id: 'n2', type: 'match', title: 'Nova oportunidade com 96% de compatibilidade', description: 'Tecnologia, região e faixa de valor combinam com o perfil.', reason: 'CNAE principal, Fortaleza e Pregão Eletrônico', createdAt: '2026-10-14T08:20:00-03:00', severity: 'info', priority: 'immediate', read: false, opportunityId: 'ti-fortaleza-2026', opportunityTitle: 'Plataforma de serviços digitais', score: 96, confidence: 88, relatedCnaes: ['6201-5/01', '6204-0/00'], destination: { kind: 'opportunity', href: '/oportunidades/ti-fortaleza-2026', label: 'Ver oportunidade' } },
    { id: 'n3', type: 'official_update', title: 'Novo anexo oficial publicado', description: 'Foi publicada uma planilha de composição de preços.', reason: 'Atualização detectada na fonte oficial', createdAt: '2026-10-13T16:10:00-03:00', severity: 'warning', priority: 'operational', read: false, opportunityId: 'equip-caucaia-2026', opportunityTitle: 'Notebooks e equipamentos de rede', destination: { kind: 'opportunity', href: '/oportunidades/equip-caucaia-2026', label: 'Consultar atualização' } },
    { id: 'g1', type: 'match', title: '4 oportunidades compatíveis para avaliar', description: 'Oportunidades com score entre 75 e 89 reunidas neste resumo.', reason: 'Categorias de TI, Ceará e valores aderentes', createdAt: '2026-10-13T11:00:00-03:00', severity: 'info', priority: 'grouped', read: false, score: 84, confidence: 78, groupCount: 4, relatedCnaes: ['6201-5/01', '6204-0/00', '4651-6/01'], destination: { kind: 'portfolio', href: '/oportunidades?grupo=compatibilidade', label: 'Ver 4 oportunidades' } },
    { id: 'n5', type: 'document_expiry', title: 'Documento vencendo em 6 dias', description: 'A Certidão Federal vence em 20 de outubro.', reason: 'Validade documental monitorada', createdAt: '2026-10-12T09:00:00-03:00', severity: 'warning', priority: 'operational', read: true, destination: { kind: 'document', href: '/oportunidades/perfil?tab=documentos', label: 'Ver documento' } },
    { id: 'n6', type: 'date_change', title: 'Data de abertura alterada', description: 'A sessão foi reagendada para 27 de outubro, às 10h.', reason: 'Retificação publicada no PNCP', createdAt: '2026-10-11T14:45:00-03:00', severity: 'warning', priority: 'operational', read: true, opportunityId: 'equip-caucaia-2026', opportunityTitle: 'Notebooks e equipamentos de rede', destination: { kind: 'opportunity', href: '/oportunidades/equip-caucaia-2026', label: 'Conferir nova data' } },
    { id: 'n7', type: 'cancelled', title: 'Oportunidade anulada', description: 'A ação original não está mais disponível.', reason: 'Anulação publicada pelo órgão', createdAt: '2026-10-10T17:30:00-03:00', severity: 'critical', priority: 'operational', read: false, stale: true, opportunityTitle: 'Aquisição de servidores — lote legado', destination: { kind: 'portfolio', href: '/oportunidades', label: 'Consultar oportunidades atuais' } },
    { id: 'n8', type: 'internal_deadline', title: 'Prazo interno hoje', description: 'A revisão técnica da proposta deve ser concluída até 16h.', reason: 'Prazo definido por Bruno Lima', createdAt: '2026-10-10T08:00:00-03:00', severity: 'critical', priority: 'operational', read: false, opportunityId: 'ti-fortaleza-2026', opportunityTitle: 'Plataforma de serviços digitais', destination: { kind: 'portfolio', href: '/oportunidades/carteira', label: 'Abrir carteira' } },
    { id: 'n9', type: 'result', title: 'Resultado publicado', description: 'O resultado final já pode ser consultado.', reason: 'Nova publicação oficial', createdAt: '2026-10-09T15:20:00-03:00', severity: 'success', priority: 'operational', read: true, opportunityId: 'consultoria-sobral-2026', opportunityTitle: 'Consultoria para transformação digital', destination: { kind: 'opportunity', href: '/oportunidades/consultoria-sobral-2026', label: 'Ver resultado' } },
    { id: 'n10', type: 'assignee', title: 'Você foi atribuída como responsável', description: 'Ana Martins atribuiu a oportunidade à Carla Souza.', reason: 'Responsável atualizado na carteira', createdAt: '2026-10-08T10:15:00-03:00', severity: 'info', priority: 'operational', read: true, opportunityId: 'suporte-maracanau-2026', opportunityTitle: 'Suporte técnico em TI', destination: { kind: 'portfolio', href: '/oportunidades/carteira', label: 'Abrir carteira' } },
  ] satisfies NotificationItem[],
} as const;
