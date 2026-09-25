'use client';
import { AlertCircle,SearchX,RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty,EmptyHeader,EmptyMedia,EmptyTitle,EmptyDescription } from '@/components/ui/empty';
export function LoadingState(){return <div aria-busy="true" aria-label="Carregando dados" className="space-y-6"><div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[1,2,3,4].map(i=><Skeleton key={i} className="h-40 rounded-lg"/>)}</div><Skeleton className="h-80 rounded-lg"/><Skeleton className="h-60 rounded-lg"/></div>;}
export function EmptyState({title='Nenhum resultado para este recorte',description='Ajuste o período ou os filtros para consultar outros dados.',onReset}:{title?:string;description?:string;onReset?:()=>void}){return <Empty><EmptyHeader><EmptyMedia variant="icon"><SearchX/></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{onReset&&<Button variant="outline" onClick={onReset}>Limpar filtros</Button>}</Empty>;}
export function ErrorState({onRetry}:{onRetry:()=>void}){return <div role="alert" className="panel flex flex-col items-center gap-4 p-10 text-center"><AlertCircle className="text-destructive size-8"/><h2 className="text-lg font-semibold">Não foi possível carregar os dados</h2><p className="text-muted-foreground">Seu recorte foi preservado. Tente consultar novamente.</p><Button variant="outline" onClick={onRetry}><RefreshCw/>Tentar novamente</Button></div>;}
