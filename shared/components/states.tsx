'use client';
import { AlertCircle,SearchX,RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty,EmptyHeader,EmptyMedia,EmptyTitle,EmptyDescription } from '@/components/ui/empty';
import { LogoIcon } from '@/shared/components/logo';

export function LoadingState({ label = 'Carregando dados' }: { label?: string }) {
  return <div data-global-loading role="status" aria-live="polite" aria-busy="true" aria-label={label} className="fixed inset-0 z-[100] grid place-items-center bg-background">
    <div className="relative grid size-28 place-items-center">
      <div aria-hidden className="absolute inset-0 rounded-full border-2 border-primary/10" />
      <div aria-hidden className="absolute inset-0 motion-safe:animate-spin rounded-full border-2 border-primary border-r-primary/15 border-b-primary/15" />
      <LogoIcon className="size-9 text-primary" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  </div>;
}
export function EmptyState({title='Nenhum resultado para este recorte',description='Ajuste o período ou os filtros para consultar outros dados.',onReset}:{title?:string;description?:string;onReset?:()=>void}){return <Empty><EmptyHeader><EmptyMedia variant="icon"><SearchX/></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{onReset&&<Button variant="outline" onClick={onReset}>Limpar filtros</Button>}</Empty>;}
export function ErrorState({onRetry}:{onRetry:()=>void}){return <div role="alert" className="panel flex flex-col items-center gap-4 p-10 text-center"><AlertCircle className="text-destructive size-8"/><h2 className="text-lg font-semibold">Não foi possível carregar os dados</h2><p className="text-muted-foreground">Seu recorte foi preservado. Tente consultar novamente.</p><Button variant="outline" onClick={onRetry}><RefreshCw/>Tentar novamente</Button></div>;}
