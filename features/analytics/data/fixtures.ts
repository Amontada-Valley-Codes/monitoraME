import type { Municipality, Supplier, Expense, Size, Origin } from './types';

export const CATEGORIES = [
  { id: '339039', name: 'Outros serviços de terceiros · PJ' },
  { id: '339030', name: 'Material de consumo' },
  { id: '449051', name: 'Obras e instalações' },
  { id: '449052', name: 'Equipamentos e material permanente' },
  { id: '339032', name: 'Distribuição gratuita' },
  { id: '339040', name: 'Serviços de TIC · PJ' },
  { id: '339035', name: 'Serviços de consultoria' },
];

export const SIZES = [
  { id: 'ME', name: 'Microempresa', color: 'var(--size-me)' },
  { id: 'MEI', name: 'Microempreendedor individual', color: 'var(--size-mei)' },
  { id: 'DEMAIS', name: 'Demais portes', color: 'var(--size-other)' },
  { id: 'NI', name: 'Não identificado', color: 'var(--size-unknown)' },
];

export const ORIGINS = [
  {
    id: 'LOCAL',
    name: 'No município comprador',
    color: 'var(--origin-local)',
  },
  {
    id: 'ESTADO',
    name: 'Em outro município do CE',
    color: 'var(--origin-state)',
  },
  { id: 'FORA', name: 'Fora do Ceará', color: 'var(--origin-external)' },
  { id: 'NI', name: 'Origem não identificada', color: 'var(--origin-unknown)' },
];

export const MUNICIPALITIES: Municipality[] = [
  ['2304400', 'Fortaleza', 'Grande Fortaleza', 2428678, 86500000],
  ['2303709', 'Caucaia', 'Grande Fortaleza', 355679, 19300000],
  ['2312908', 'Sobral', 'Sertão de Sobral', 203023, 16100000],
  ['2307304', 'Juazeiro do Norte', 'Cariri', 286120, 14700000],
  ['2307650', 'Maracanaú', 'Grande Fortaleza', 234392, 11800000],
  ['2304202', 'Crato', 'Cariri', 131050, 9100000],
  ['2306405', 'Itapipoca', 'Litoral Oeste', 131123, 7800000],
  ['2305506', 'Iguatu', 'Centro-Sul', 98604, 6500000],
  ['2311306', 'Quixadá', 'Sertão Central', 84168, 5900000],
  ['2313401', 'Tianguá', 'Serra da Ibiapaba', 76137, 4900000],
  ['2300200', 'Acaraú', 'Litoral Norte', 64999, 4700000],
  ['2300754', 'Amontada', 'Litoral Oeste', 42853, 3800000],
  ['2306553', 'Itarema', 'Litoral Norte', 42467, 3400000],
  ['2303501', 'Cascavel', 'Grande Fortaleza', 72328, 4600000],
  ['2311405', 'Quixeramobim', 'Sertão Central', 82320, 5300000],
  ['2304103', 'Crateús', 'Sertão dos Crateús', 76519, 5700000],
  ['2302508', 'Brejo Santo', 'Cariri', 51633, 3300000],
  ['2306256', 'Itaitinga', 'Grande Fortaleza', 64708, 3100000],
  ['2311801', 'Russas', 'Vale do Jaguaribe', 72928, 5500000],
  ['2303402', 'Carnaubal', 'Serra da Ibiapaba', 17362, 0],
].map(([id, name, region, population, monthly]) => ({
  id: String(id),
  name: String(name),
  region: String(region),
  population: Number(population),
  monthly: Number(monthly),
  uf: 'CE',
}));

const supplierNames = [
  'Horizonte Serviços',
  'Costa Norte Comércio',
  'Vale Soluções',
  'Litoral Equipamentos',
  'Alvorada Engenharia',
  'Sertão Distribuidora',
  'Nova Rota Tecnologia',
  'Cariri Consultoria',
  'Raízes Alimentos',
  'Ceará Infraestrutura',
];

export const SUPPLIERS: Supplier[] = [];
export const EXPENSES: Expense[] = [];

const acarauMatrix = [
  [180, 1340, 800, 100],
  [120, 500, 300, 80],
  [150, 2000, 2000, 210],
  [30, 100, 100, 120],
];

MUNICIPALITIES.forEach((municipality, mi) => {
  if (!municipality.monthly) return;

  SIZES.forEach((size, si) =>
    ORIGINS.forEach((origin, oi) => {
      const id = `F${mi}-${si}-${oi}`;
      const city =
        oi === 0
          ? municipality
          : oi === 1
            ? MUNICIPALITIES[(mi + 3) % 19]
            : null;

      SUPPLIERS.push({
        id,
        name:
          size.id === 'NI'
            ? 'Fornecedor não identificado'
            : `${supplierNames[(mi + si + oi) % 10]} ${municipality.name} ${
                size.id === 'MEI' ? 'MEI' : 'Ltda.'
              }`,
        cnpj:
          size.id === 'NI'
            ? 'Não identificado'
            : `00.${String(mi + 10).padStart(3, '0')}.${String(
                si * 100 + oi + 1
              ).padStart(3, '0')}/0001-00`,
        size: size.id as Size,
        city:
          oi === 3
            ? 'Não identificada'
            : (city?.name ?? 'São Paulo'),
        ibge: city?.id ?? (oi === 2 ? '3550308' : ''),
        uf: oi === 3 ? '—' : (city?.uf ?? 'SP'),
        status:
          size.id === 'NI'
            ? 'Não identificada'
            : (mi + si) % 17 === 0
              ? 'Baixada'
              : 'Ativa',
        nature:
          size.id === 'MEI'
            ? 'Empresário individual'
            : 'Sociedade empresária limitada',
      });
    })
  );

  for (let year = 2024; year <= 2026; year++) {
    for (let month = 1; month <= (year === 2026 ? 8 : 12); month++) {
      const factor =
        [
          0.71, 0.77, 0.88, 0.82, 0.98, 0.93, 1.05, 1.12, 1.03, 1.15, 1.23,
          1.37,
        ][month - 1] *
        (1 + (year - 2024) * 0.087);

      const monthly =
        Math.round((municipality.monthly * factor) / 100) * 10000;

      SIZES.forEach((size, si) =>
        ORIGINS.forEach((origin, oi) => {
          const me =
            0.235 +
            (mi % 5) * 0.015 +
            (year - 2025) * 0.003 +
            (month - 6) * 0.0006;
          const mei = 0.045 + (mi % 6) * 0.009;
          const demais =
            0.532 -
            (mi % 5) * 0.019 -
            (mi % 4) * 0.009 -
            (mi % 6) * 0.009 -
            (year - 2025) * 0.004 -
            (month - 6) * 0.0006;
          const ni = 0.018 + (mi % 5) * 0.004;

          const defaultSize = [me, mei, demais, ni][si];
          const local =
            0.23 +
            (mi % 7) * 0.044 +
            (year - 2025) * 0.012 +
            (month - 6) * 0.001;

          const fraction =
            municipality.id === '2300200'
              ? acarauMatrix[si][oi] / 10000
              : defaultSize * [local, 0.32, 0.65 - local, 0.03][oi];

          const net = Math.round(monthly * fraction);
          const cancelled =
            (mi + si + month + oi) % 9 === 0 ? Math.round(net * 0.06) : 0;
          const category = CATEGORIES[(si * 4 + oi + month + mi) % 7];

          EXPENSES.push({
            id: `EMP-${year}-${mi.toString().padStart(2, '0')}${month
              .toString()
              .padStart(2, '0')}${si}${oi}`,
            date: `${year}-${String(month).padStart(2, '0')}-${String(
              5 + si * 3 + oi
            ).padStart(2, '0')}`,
            municipality: municipality.id,
            supplier: `F${mi}-${si}-${oi}`,
            size: size.id as Size,
            origin: origin.id as Origin,
            category: category.id,
            gross: net + cancelled,
            cancelled,
            net,
            description: `${category.name} para atendimento das atividades municipais. Registro ilustrativo de ${municipality.name}.`,
            provenance: year === 2024 ? 'RETRATO_ATUAL' : 'HISTORICO',
            meiDiscriminated: true,
          });
        })
      );
    }
  }
});

export const DEFAULT_FILTERS = {
  uf: 'CE',
  municipality: 'all',
  start: '2025-01-01',
  end: '2025-12-31',
  size: 'all',
  origin: 'all',
  categories: CATEGORIES.map((c) => c.id),
};

export const SOURCE_META = {
  updated: '2026-09-10',
  reference: '2026-08-31',
  source: 'TCE-CE / SIM · Receita Federal · IBGE',
  isDemo: true,
  policyVersion: 'rn-2026-09',
  coverage: 19,
};