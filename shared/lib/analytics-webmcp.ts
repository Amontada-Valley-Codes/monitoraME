'use client';
import { useEffect,useRef } from 'react';
import type { AnalyticsResult } from '@/features/analytics/data/repository';
import type { Filters,LoadState } from '@/features/analytics/data/types';
type Context={registerTool:(tool:{name:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown},options:{signal:AbortSignal})=>void|Promise<void>};
/** Read-only bridge. Unsupported browsers keep the full visible experience. */
export function useAnalyticsWebMCP(filters:Filters,data:AnalyticsResult|null,state:LoadState){
 const current=useRef({filters,data,state});current.current={filters,data,state};
 useEffect(()=>{const context=(document as Document & {modelContext?:Context}).modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();
 try{void Promise.resolve(context.registerTool({name:'read_analytics_summary',description:'Read the currently selected demonstration filters and the same summary shown in MonitoraME. Money is integer cents. The ME metric includes microenterprises only.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object.');const v=current.current;if(v.state!=='ready'||!v.data)throw new Error('Analytics are not ready.');return {demo:true,filters:v.filters,totalCents:v.data.summary.total,meCents:v.data.summary.mpe,records:v.data.summary.count};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}return()=>lifecycle.abort();},[]);
}
