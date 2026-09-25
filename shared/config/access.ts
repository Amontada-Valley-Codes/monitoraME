/** Adaptador de sessão será fornecido pelo backend; isto não é autorização real. */
export type Role = 'visitor' | 'municipal_manager' | 'monitor' | 'admin';
const fullAccess = { readAnalytics:true, manageGoals:true, manageReports:true } as const;
export const ROLE_PERMISSIONS = { visitor:{readAnalytics:true,manageGoals:false,manageReports:true}, municipal_manager:{readAnalytics:true,manageGoals:true,manageReports:true}, monitor:fullAccess, admin:fullAccess };
export const DEMO_SESSION = { role:'monitor' as Role, label:'Monitor / Admin', demonstration:true };
export const ANALYTICS_POLICY = { mpeSizes:['ME'], separateMEI:true, unknownInDenominator:true, geographyKey:'ibge+uf', source:'TCE-CE / SIM', moneyUnit:'centavos' } as const;

export const isMpe=(size:string)=>ANALYTICS_POLICY.mpeSizes.some(value=>value===size);
