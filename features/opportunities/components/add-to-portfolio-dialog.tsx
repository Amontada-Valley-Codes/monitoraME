'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Opportunity } from '../types';

export function AddToPortfolioDialog({
  available,
  disabled,
  onAdd,
}: {
  available: Opportunity[];
  disabled?: boolean;
  onAdd: (opportunityId: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const add = async (id: string) => {
    setAddingId(id);
    const added = await onAdd(id);
    setAddingId(null);
    if (added) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 min-h-9!" disabled={disabled}>
          <Plus />
          Adicionar oportunidade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar à carteira</DialogTitle>
          <DialogDescription>Oportunidades do Radar que ainda não estão sendo acompanhadas.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 divide-y overflow-y-auto rounded-lg border">
          {available.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.organization} · {item.modality}</p>
              </div>
              <Button size="sm" variant="outline" disabled={addingId !== null} onClick={() => add(item.id)}>
                {addingId === item.id ? <Loader2 className="animate-spin" /> : <Plus />}
                Adicionar
              </Button>
            </div>
          ))}
          {!available.length && (
            <p className="p-6 text-center text-sm text-muted-foreground">Todas as oportunidades do Radar já estão na carteira.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
