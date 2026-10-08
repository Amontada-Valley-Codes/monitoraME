/** Adaptador de sessão será fornecido pelo backend; isto não é autorização real. */
export type Role = 'visitor' | 'municipal_manager' | 'monitor' | 'admin';
export type AccessLevel = 'free' | 'restricted';

export type RestrictedFeature = {
  name: string;
  description: string;
};

const RESTRICTED_ROUTES: Record<string, RestrictedFeature> = {
  '/analitico/despesas': {
    name: 'Despesas empenhadas',
    description: 'Consulte empenhos, fornecedores e o detalhamento das rubricas do recorte selecionado.',
  },
  '/analitico/territorio': {
    name: 'Análise territorial',
    description: 'Entenda a circulação dos recursos e identifique oportunidades em cada território.',
  },
  '/analitico/comparar': {
    name: 'Comparação de resultados',
    description: 'Compare períodos e municípios para encontrar variações e tendências relevantes.',
  },
};

export function getRestrictedFeature(path: string): RestrictedFeature | null {
  const route = Object.keys(RESTRICTED_ROUTES).find(
    (restrictedPath) => path === restrictedPath || path.startsWith(`${restrictedPath}/`),
  );

  return route ? RESTRICTED_ROUTES[route] : null;
}
const fullAccess = { readAnalytics:true, manageGoals:true, manageReports:true } as const;
export const ROLE_PERMISSIONS = { visitor:{readAnalytics:true,manageGoals:false,manageReports:true}, municipal_manager:{readAnalytics:true,manageGoals:true,manageReports:true}, monitor:fullAccess, admin:fullAccess };
export const DEMO_SESSION = { role:'monitor' as Role, label:'Monitor / Admin', demonstration:true };
export const ANALYTICS_POLICY = { mpeSizes:['ME'], separateMEI:true, unknownInDenominator:true, geographyKey:'ibge+uf', source:'Dados públicos consolidados', moneyUnit:'centavos' } as const;

export const isMpe=(size:string)=>ANALYTICS_POLICY.mpeSizes.some(value=>value===size);
