import type { AdminActivity, AdminCompany, AdminMunicipality, CompanyAccessStatus, CompanySize } from './types';

/** Dados exclusivamente demonstrativos: empresas e CNPJs fictícios. Não representam cadastros reais. */
const city = (name: string, ibge_code: string): AdminMunicipality => ({ name, uf: 'CE', ibge_code });
const FORTALEZA = city('Fortaleza', '2304400');
const CAUCAIA = city('Caucaia', '2303709');
const MARACANAU = city('Maracanaú', '2307650');
const SOBRAL = city('Sobral', '2312908');
const JUAZEIRO = city('Juazeiro do Norte', '2307304');
const CRATO = city('Crato', '2304202');
const EUSEBIO = city('Eusébio', '2304285');
const IGUATU = city('Iguatu', '2305506');
const QUIXADA = city('Quixadá', '2311306');

const CNAES = {
  software: { code: '6201-5/01', description: 'Desenvolvimento de programas de computador sob encomenda' },
  consulting: { code: '6204-0/00', description: 'Consultoria em tecnologia da informação' },
  hardware: { code: '4651-6/01', description: 'Comércio atacadista de equipamentos de informática' },
  cleaning: { code: '8121-4/00', description: 'Limpeza em prédios e em domicílios' },
  food: { code: '5620-1/01', description: 'Fornecimento de alimentos preparados para empresas' },
  health: { code: '4645-1/01', description: 'Comércio atacadista de instrumentos e materiais médico-hospitalares' },
  construction: { code: '4120-4/00', description: 'Construção de edifícios' },
  office: { code: '4761-0/03', description: 'Comércio varejista de artigos de papelaria' },
};

type Seed = {
  id: string; legal_name: string; trade_name?: string; cnpj: string; size: CompanySize; municipality: AdminMunicipality;
  cnae: keyof typeof CNAES; status: CompanyAccessStatus; registered_at: string; plan?: string;
  protocol?: string; documents?: number; reason?: string; decided_at?: string; decided_by?: string;
};

function company(seed: Seed): AdminCompany {
  const submitted = { id: `${seed.id}-v1`, status: 'pending' as const, occurred_at: seed.registered_at, author_name: 'Solicitação da empresa' };
  const decision = seed.status === 'pending'
    ? []
    : [{ id: `${seed.id}-v2`, status: seed.status === 'suspended' ? 'active' as const : seed.status, occurred_at: seed.decided_at ?? seed.registered_at, author_name: seed.decided_by ?? 'Equipe MonitoraME', reason: seed.status === 'rejected' ? seed.reason : undefined }];
  const suspension = seed.status === 'suspended'
    ? [{ id: `${seed.id}-v3`, status: 'suspended' as const, occurred_at: seed.decided_at ?? seed.registered_at, author_name: seed.decided_by ?? 'Equipe MonitoraME', reason: seed.reason }]
    : [];
  const history = [...suspension, ...decision, submitted];
  return {
    id: seed.id,
    legal_name: seed.legal_name,
    trade_name: seed.trade_name ?? null,
    cnpj: seed.cnpj,
    company_size: seed.size,
    municipality: seed.municipality,
    primary_cnae: CNAES[seed.cnae],
    access_status: seed.status,
    plan_name: seed.plan ?? (seed.status === 'active' || seed.status === 'suspended' ? 'Gratuito' : null),
    contact_email: `contato@${seed.id}.example`,
    registered_at: seed.registered_at,
    updated_at: history[0].occurred_at,
    version: history.length,
    access_request: seed.protocol ? { protocol: seed.protocol, submitted_at: seed.registered_at, documents_count: seed.documents ?? 3 } : null,
    status_history: history,
  };
}

export const adminDemoFixture = {
  generated_at: '2026-10-21T08:00:00-03:00',
  companies: [
    company({ id: 'company-demo-nordeste', legal_name: 'Nordeste Soluções e Suprimentos Ltda.', trade_name: 'Nordeste Conecta', cnpj: '00000000000191', size: 'me', municipality: FORTALEZA, cnae: 'software', status: 'active', plan: 'Equipe', registered_at: '2026-08-04T10:12:00-03:00', decided_at: '2026-08-05T15:40:00-03:00', decided_by: 'Marina Alves' }),
    company({ id: 'monitora-me-tecnologia', legal_name: 'Monitora ME Tecnologia Ltda.', trade_name: 'MonitoraME', cnpj: '12345678000199', size: 'me', municipality: FORTALEZA, cnae: 'consulting', status: 'pending', protocol: 'REQ-2026-88A9F', documents: 3, registered_at: '2026-10-17T09:20:00-03:00' }),
    company({ id: 'cariri-digital', legal_name: 'Cariri Digital Sistemas Ltda.', trade_name: 'Cariri Digital', cnpj: '00000002000110', size: 'epp', municipality: JUAZEIRO, cnae: 'software', status: 'pending', protocol: 'REQ-2026-91C2D', documents: 4, registered_at: '2026-10-14T16:05:00-03:00' }),
    company({ id: 'sertao-limpeza', legal_name: 'Sertão Serviços de Limpeza Ltda.', cnpj: '00000003000105', size: 'me', municipality: QUIXADA, cnae: 'cleaning', status: 'pending', protocol: 'REQ-2026-93F10', documents: 2, registered_at: '2026-10-19T11:48:00-03:00' }),
    company({ id: 'litoral-alimentos', legal_name: 'Litoral Alimentos e Refeições Ltda.', trade_name: 'Sabor Litoral', cnpj: '00000004000180', size: 'epp', municipality: CAUCAIA, cnae: 'food', status: 'pending', protocol: 'REQ-2026-94A7B', documents: 4, registered_at: '2026-10-20T14:30:00-03:00' }),
    company({ id: 'maracanau-informatica', legal_name: 'Maracanaú Informática Ltda.', cnpj: '00000005000124', size: 'me', municipality: MARACANAU, cnae: 'hardware', status: 'active', plan: 'Essencial', registered_at: '2026-07-22T08:30:00-03:00', decided_at: '2026-07-23T10:00:00-03:00', decided_by: 'Marina Alves' }),
    company({ id: 'sobral-tech', legal_name: 'Sobral Tech Consultoria Ltda.', trade_name: 'Sobral Tech', cnpj: '00000006000169', size: 'me', municipality: SOBRAL, cnae: 'consulting', status: 'active', plan: 'Equipe', registered_at: '2026-06-10T13:00:00-03:00', decided_at: '2026-06-11T09:15:00-03:00', decided_by: 'Rafael Costa' }),
    company({ id: 'crato-papelaria', legal_name: 'Papelaria Crato Ltda.', cnpj: '00000007000103', size: 'mei', municipality: CRATO, cnae: 'office', status: 'active', registered_at: '2026-09-02T17:20:00-03:00', decided_at: '2026-09-03T11:30:00-03:00', decided_by: 'Rafael Costa' }),
    company({ id: 'eusebio-obras', legal_name: 'Eusébio Construções e Reformas Ltda.', cnpj: '00000008000148', size: 'epp', municipality: EUSEBIO, cnae: 'construction', status: 'active', plan: 'Essencial', registered_at: '2026-05-18T09:45:00-03:00', decided_at: '2026-05-19T16:10:00-03:00', decided_by: 'Marina Alves' }),
    company({ id: 'fortaleza-med', legal_name: 'Fortaleza Med Distribuidora Ltda.', trade_name: 'Fortaleza Med', cnpj: '00000009000192', size: 'epp', municipality: FORTALEZA, cnae: 'health', status: 'active', plan: 'Equipe', registered_at: '2026-04-28T10:00:00-03:00', decided_at: '2026-04-29T14:00:00-03:00', decided_by: 'Rafael Costa' }),
    company({ id: 'iguatu-redes', legal_name: 'Iguatu Redes e Telecom Ltda.', cnpj: '00000010000117', size: 'me', municipality: IGUATU, cnae: 'hardware', status: 'active', registered_at: '2026-08-19T15:15:00-03:00', decided_at: '2026-08-20T10:40:00-03:00', decided_by: 'Marina Alves' }),
    company({ id: 'caucaia-limpa', legal_name: 'Caucaia Limpa Serviços Ltda.', cnpj: '00000011000161', size: 'mei', municipality: CAUCAIA, cnae: 'cleaning', status: 'active', registered_at: '2026-09-11T09:00:00-03:00', decided_at: '2026-09-12T13:20:00-03:00', decided_by: 'Rafael Costa' }),
    company({ id: 'ceara-softhouse', legal_name: 'Ceará Softhouse Ltda.', trade_name: 'Softhouse CE', cnpj: '00000012000106', size: 'me', municipality: FORTALEZA, cnae: 'software', status: 'active', plan: 'Essencial', registered_at: '2026-03-30T11:10:00-03:00', decided_at: '2026-03-31T09:00:00-03:00', decided_by: 'Marina Alves' }),
    company({ id: 'quixada-alimentos', legal_name: 'Quixadá Alimentos Ltda.', cnpj: '00000013000150', size: 'me', municipality: QUIXADA, cnae: 'food', status: 'active', registered_at: '2026-07-07T08:00:00-03:00', decided_at: '2026-07-08T15:30:00-03:00', decided_by: 'Rafael Costa' }),
    company({ id: 'juazeiro-hospitalar', legal_name: 'Juazeiro Hospitalar Comércio Ltda.', cnpj: '00000014000195', size: 'other', municipality: JUAZEIRO, cnae: 'health', status: 'active', plan: 'Equipe', registered_at: '2026-02-14T14:00:00-03:00', decided_at: '2026-02-16T10:00:00-03:00', decided_by: 'Marina Alves' }),
    company({ id: 'maracanau-obras', legal_name: 'Construtora Pitaguary Ltda.', cnpj: '00000015000130', size: 'epp', municipality: MARACANAU, cnae: 'construction', status: 'suspended', registered_at: '2026-03-03T10:00:00-03:00', decided_at: '2026-10-09T17:05:00-03:00', decided_by: 'Rafael Costa', reason: 'Certidão de regularidade fiscal apresentada com indício de adulteração.' }),
    company({ id: 'sobral-papel', legal_name: 'Sobral Papel e Escritório Ltda.', cnpj: '00000016000174', size: 'mei', municipality: SOBRAL, cnae: 'office', status: 'suspended', registered_at: '2026-06-25T09:30:00-03:00', decided_at: '2026-10-15T11:45:00-03:00', decided_by: 'Marina Alves', reason: 'Uso do acesso por terceiros não vinculados à empresa.' }),
    company({ id: 'crato-eventos', legal_name: 'Crato Eventos e Buffet Ltda.', cnpj: '00000017000119', size: 'me', municipality: CRATO, cnae: 'food', status: 'rejected', protocol: 'REQ-2026-77B31', registered_at: '2026-09-20T10:00:00-03:00', decided_at: '2026-09-23T16:00:00-03:00', decided_by: 'Rafael Costa', reason: 'Contrato social ilegível; representante legal não identificado.' }),
    company({ id: 'eusebio-tecnologia', legal_name: 'Eusébio Tecnologia Ltda.', cnpj: '00000018000163', size: 'me', municipality: EUSEBIO, cnae: 'software', status: 'rejected', protocol: 'REQ-2026-80D44', registered_at: '2026-10-01T15:20:00-03:00', decided_at: '2026-10-03T09:10:00-03:00', decided_by: 'Marina Alves', reason: 'CNPJ com situação cadastral inapta na Receita Federal.' }),
  ] satisfies AdminCompany[],
  activity: [
    { id: 'a1', occurred_at: '2026-10-20T14:30:00-03:00', author_name: 'Sabor Litoral', description: 'Nova solicitação de acesso enviada (REQ-2026-94A7B).', company_id: 'litoral-alimentos' },
    { id: 'a2', occurred_at: '2026-10-19T11:48:00-03:00', author_name: 'Sertão Serviços de Limpeza', description: 'Nova solicitação de acesso enviada com documentação incompleta.', company_id: 'sertao-limpeza' },
    { id: 'a3', occurred_at: '2026-10-15T11:45:00-03:00', author_name: 'Marina Alves', description: 'Suspendeu o acesso de Sobral Papel e Escritório Ltda.', company_id: 'sobral-papel' },
    { id: 'a4', occurred_at: '2026-10-09T17:05:00-03:00', author_name: 'Rafael Costa', description: 'Suspendeu o acesso de Construtora Pitaguary Ltda.', company_id: 'maracanau-obras' },
    { id: 'a5', occurred_at: '2026-10-03T09:10:00-03:00', author_name: 'Marina Alves', description: 'Rejeitou a solicitação de Eusébio Tecnologia Ltda.', company_id: 'eusebio-tecnologia' },
  ] satisfies AdminActivity[],
} as const;
