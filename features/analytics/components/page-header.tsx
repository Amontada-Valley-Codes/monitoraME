import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b border-border/70 pb-5">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="eyebrow mb-2 text-primary">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
