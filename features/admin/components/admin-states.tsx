import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminPageSkeleton({ label = 'Carregando painel administrativo' }: { label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="mx-auto max-w-[1480px] space-y-4">
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export function AdminPageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <header className="mx-auto mb-6 flex max-w-[1480px] flex-wrap items-end gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {children}
    </header>
  );
}
