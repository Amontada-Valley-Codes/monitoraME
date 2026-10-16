'use client';

import Link from 'next/link';
import { AlertTriangle, BellRing, Layers3, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NotificationItem as Notification } from '../demo-fixture';
import { useNotifications } from '../notification-context';

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export function NotificationRow({ item, compact = false }: { item: Notification; compact?: boolean }) {
  const { markRead } = useNotifications();
  const critical = item.severity === 'critical';
  return (
    <article className={cn('relative border-b p-4 last:border-b-0', !item.read && 'bg-primary/[0.035]', item.read && 'text-muted-foreground opacity-70', critical && 'border-l-4 border-l-warning')}>
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted', critical && 'bg-warning-soft text-warning')} aria-hidden>
          {critical ? <ShieldAlert className="size-4" /> : item.priority === 'grouped' ? <Layers3 className="size-4" /> : <BellRing className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {critical && <Badge className="bg-warning-soft text-warning hover:bg-warning-soft"><AlertTriangle className="size-3" /> Crítica</Badge>}
            {item.priority === 'grouped' && <Badge variant="secondary">Agrupamento · {item.groupCount} itens</Badge>}
            <time className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</time>
          </div>
          <h2 className={cn('mt-2 text-sm font-semibold leading-snug', !compact && 'sm:text-base')}>{item.title}</h2>
          {item.opportunityTitle && <p className="mt-1 text-xs font-medium text-primary">{item.opportunityTitle}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          {!compact && <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs"><span className="font-semibold">Motivo:</span> {item.reason}{item.score && <> · Score {item.score}% · Confiança {item.confidence}%</>}</div>}
          {item.stale && <p role="status" className="mt-2 text-xs font-medium text-warning">Evento desatualizado: o destino foi substituído por uma alternativa segura.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant={critical ? 'default' : 'outline'} onClick={() => markRead(item.id)}>
              <Link href={item.destination.href}>{item.destination.label}</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
