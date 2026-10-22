'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { NOTE_MAX_LENGTH, type PortfolioEntry } from '../portfolio';

const noteSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Escreva a observação antes de salvar.')
    .max(NOTE_MAX_LENGTH, `A observação deve ter no máximo ${NOTE_MAX_LENGTH} caracteres.`),
});

type NoteFormData = z.infer<typeof noteSchema>;

export function PortfolioNoteDialog({
  entry,
  disabled,
  onSave,
}: {
  entry: PortfolioEntry;
  disabled?: boolean;
  onSave: (text: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(entry.note);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: entry.note?.text ?? '' },
  });
  const length = useWatch({ control, name: 'text' }).length;

  const changeOpen = (value: boolean) => {
    if (isSubmitting) return;
    if (value) reset({ text: entry.note?.text ?? '' });
    setOpen(value);
  };
  // O diálogo só fecha quando o salvamento é confirmado; em caso de erro o texto digitado é mantido.
  const submit = async ({ text }: NoteFormData) => {
    if (await onSave(text)) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <NotebookPen />
          {editing ? 'Editar observação' : 'Adicionar observação'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar observação' : 'Nova observação'}</DialogTitle>
            <DialogDescription>
              Nota privada da Nordeste Conecta sobre “{entry.opportunity.title}”. Visível apenas para a equipe da empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="portfolio-note" className="text-sm font-medium">
              Observação
            </label>
            <Textarea
              id="portfolio-note"
              rows={6}
              className="max-h-72"
              placeholder="Ex.: confirmar atestados técnicos com o setor de engenharia antes da sessão."
              aria-invalid={!!errors.text}
              aria-describedby="portfolio-note-hint"
              disabled={isSubmitting}
              {...register('text')}
            />
            <div id="portfolio-note-hint" className="flex items-start justify-between gap-3 text-xs">
              <span className={errors.text ? 'text-destructive' : 'text-muted-foreground'}>
                {errors.text?.message ?? 'As alterações ficam registradas no histórico com o autor.'}
              </span>
              <span
                aria-live="polite"
                className={cn('shrink-0 tabular-nums', length > NOTE_MAX_LENGTH ? 'font-semibold text-destructive' : 'text-muted-foreground')}
              >
                {length}/{NOTE_MAX_LENGTH}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => changeOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? 'Salvando...' : 'Salvar observação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
