'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Target, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../components/page-header';
import { MunicipalityPicker } from '../components/global-filters';
import { SelectField } from '@/shared/components/select-field';
import { ConfirmAction } from '@/shared/components/confirm-action';
import { useLocalCollection } from '@/shared/lib/use-local-collection';
import { DEFAULT_FILTERS, MUNICIPALITIES } from '../data/fixtures';
import { aggregate, selectExpenses } from '../data/repository';
import { percent, ratio, points } from '@/shared/lib/format';
import type { Goal } from '../data/types';
import { EmptyState } from '@/shared/components/states';
import { ROLE_PERMISSIONS, DEMO_SESSION } from '@/shared/config/access';
import { localId } from '@/shared/lib/local-id';
import { useAnalytics } from '../data/context';

const labels = {
  mpe: 'Participação de ME',
  local: 'Fornecedores locais',
  mpeLocal: 'ME sediadas no município',
};

const initial: Goal[] = [
  {
    id: 'g1',
    municipality: '2300200',
    year: '2025',
    indicator: 'mpe',
    target: 45,
    notes: 'Ampliar a participação de microempresas.',
    archived: false,
  },
  {
    id: 'g2',
    municipality: '2300754',
    year: '2025',
    indicator: 'local',
    target: 50,
    notes: 'Acompanhar a retenção econômica no município.',
    archived: false,
  },
  {
    id: 'g3',
    municipality: '2312908',
    year: '2025',
    indicator: 'mpe',
    target: 50,
    notes: 'Meta anual de gestão.',
    archived: false,
  },
];

export default function Goals() {
  const { filters } = useAnalytics();
  const { items, save } = useLocalCollection<Goal>(
    'monitorame.goals.v1',
    initial
  );
  const [open, setOpen] = useState(false);
  const [archived, setArchived] = useState(false);
  const [city, setCity] = useState(filters.municipality);
  const [year, setYear] = useState('2025');
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Goal>(initial[0]);
  const [confirm, setConfirm] = useState<{
    goal: Goal;
    action: 'archive' | 'delete';
  } | null>(null);

  const allowed = ROLE_PERMISSIONS[DEMO_SESSION.role].manageGoals;

  function edit(goal?: Goal) {
    setDraft(
      goal ?? {
        id: '',
        municipality: city === 'all' ? '2300200' : city,
        year,
        indicator: 'mpe',
        target: 45,
        notes: '',
        archived: false,
      }
    );
    setError('');
    setOpen(true);
  }

  function submit() {
    if (
      !Number.isFinite(draft.target) ||
      draft.target < 0 ||
      draft.target > 100
    ) {
      setError('Informe um percentual entre 0 e 100.');
      return;
    }
    if (
      items.some(
        (g) =>
          g.id !== draft.id &&
          !g.archived &&
          g.municipality === draft.municipality &&
          g.year === draft.year &&
          g.indicator === draft.indicator
      )
    ) {
      setError(
        'Já existe uma meta ativa para este município, exercício e indicador.'
      );
      return;
    }
    const next = draft.id
      ? items.map((g) => (g.id === draft.id ? draft : g))
      : [...items, { ...draft, id: localId() }];

    if (save(next)) {
      toast.success('Meta salva neste navegador.');
      setOpen(false);
    }
  }

  const shown = items.filter(
    (g) =>
      g.archived === archived &&
      (city === 'all' || g.municipality === city) &&
      g.year === year
  );

  return (
    <>
      <PageHeader
        eyebrow="Objetivos municipais"
        title="Metas de gestão"
        description="Defina e acompanhe objetivos de participação nas compras públicas."
        actions={
          allowed && (
            <Button onClick={() => edit()}>
              <Plus />
              Criar meta
            </Button>
          )
        }
      />
      <Alert className="mb-6 border-primary/15 bg-secondary/40">
        <Info className="size-4" />
        <AlertDescription>
          Metas são objetivos de gestão, sem caráter de obrigação legal. Nesta
          demonstração, alterações ficam apenas neste navegador.
        </AlertDescription>
      </Alert>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <MunicipalityPicker value={city} onChange={setCity} />
        <SelectField
          label="Exercício da meta"
          value={year}
          onChange={setYear}
          options={['2024', '2025', '2026'].map((y) => ({
            value: y,
            label: `Exercício ${y}`,
          }))}
        />
        <Label className="ml-auto flex items-center gap-2">
          <Switch checked={archived} onCheckedChange={setArchived} />
          Arquivadas
        </Label>
      </div>
      {!shown.length ? (
        <EmptyState
          title={
            archived ? 'Nenhuma meta arquivada' : 'Nenhuma meta neste recorte'
          }
          description="Crie uma meta ou escolha outro município e exercício."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((g) => {
            const a = aggregate(
              selectExpenses({
                ...DEFAULT_FILTERS,
                municipality: g.municipality,
                start: g.year + '-01-01',
                end: g.year + '-12-31',
              })
            );
            const actual = ratio(a[g.indicator], a.total);
            const met = actual >= g.target;

            return (
              <section className="panel p-6" key={g.id}>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Target className="size-5" />
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ações da meta ${
                          MUNICIPALITIES.find((m) => m.id === g.municipality)
                            ?.name
                        }`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => edit(g)}>
                        Editar meta
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          setConfirm({ goal: g, action: 'archive' })
                        }
                      >
                        {g.archived ? 'Restaurar' : 'Arquivar'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={() =>
                          setConfirm({ goal: g, action: 'delete' })
                        }
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h2 className="mt-4 font-semibold">
                  {
                    MUNICIPALITIES.find((m) => m.id === g.municipality)
                      ?.name
                  }
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {labels[g.indicator]} · {g.year}
                </p>
                <div className="mt-6 flex items-end justify-between">
                  <p className="metric text-3xl text-primary">
                    {a.count ? percent(actual) : '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Meta{' '}
                    <strong className="text-foreground">
                      {percent(g.target)}
                    </strong>
                  </p>
                </div>
                <Progress
                  aria-label={`Progresso da meta: ${percent(actual)} de ${percent(
                    g.target
                  )}`}
                  value={
                    g.target
                      ? Math.min(100, (actual / g.target) * 100)
                      : 100
                  }
                  className="my-4 h-2"
                />
                <Badge
                  variant="outline"
                  className={
                    met
                      ? 'bg-success-soft text-success'
                      : 'bg-warning-soft text-warning'
                  }
                >
                  {g.archived
                    ? 'Arquivada'
                    : !a.count
                      ? 'Sem dados'
                      : met
                        ? 'Meta alcançada'
                        : `${points(g.target - actual)} para a meta`}
                </Badge>
                <p className="mt-4 text-sm text-muted-foreground">{g.notes}</p>
                <p className="mt-5 border-t pt-3 text-xs text-muted-foreground">
                  Exercício completo · sete naturezas ·{' '}
                  {g.indicator === 'local' ? 'porte: todos' : 'porte: ME'} ·{' '}
                  {g.indicator === 'mpe'
                    ? 'origem: todas'
                    : 'origem: município comprador'}
                  {g.year === '2026' ? ' · base parcial até agosto' : ''}
                </p>
              </section>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {draft.id ? 'Editar meta' : 'Criar meta de gestão'}
            </DialogTitle>
            <DialogDescription>
              Uma meta ativa por município, exercício e indicador.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-4"
          >
            <div>
              <Label className="mb-2">Município</Label>
              <MunicipalityPicker
                value={draft.municipality}
                onChange={(municipality) =>
                  setDraft({ ...draft, municipality })
                }
                all={false}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Exercício</Label>
                <SelectField
                  value={draft.year}
                  onChange={(year) => setDraft({ ...draft, year })}
                  label="Exercício"
                  className="w-full"
                  options={['2024', '2025', '2026'].map((y) => ({
                    value: y,
                    label: y,
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="goal-target" className="mb-2">
                  Meta (%)
                </Label>
                <Input
                  id="goal-target"
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={Number.isNaN(draft.target) ? '' : draft.target}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      target:
                        e.target.value === '' ? NaN : Number(e.target.value),
                    })
                  }
                  aria-invalid={!!error}
                  aria-describedby={error ? 'goal-error' : undefined}
                />
              </div>
            </div>
            <div>
              <Label className="mb-2">Indicador</Label>
              <SelectField
                label="Indicador"
                value={draft.indicator}
                onChange={(indicator) =>
                  setDraft({
                    ...draft,
                    indicator: indicator as Goal['indicator'],
                  })
                }
                className="w-full"
                options={Object.entries(labels).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </div>
            <div>
              <Label htmlFor="goal-notes" className="mb-2">
                Observações
              </Label>
              <Textarea
                id="goal-notes"
                value={draft.notes}
                maxLength={500}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </div>
            {error && (
              <p id="goal-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar meta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmAction
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.action === 'delete'
            ? 'Excluir meta?'
            : confirm?.goal.archived
              ? 'Restaurar meta?'
              : 'Arquivar meta?'
        }
        description={
          confirm?.action === 'delete'
            ? 'Esta meta será removida deste navegador. A exclusão não altera os dados públicos.'
            : 'A meta será movida entre as listas de ativas e arquivadas.'
        }
        destructive={confirm?.action === 'delete'}
        onConfirm={() => {
          if (!confirm) return;
          if (
            confirm.action === 'archive' &&
            confirm.goal.archived &&
            items.some(
              (g) =>
                !g.archived &&
                g.id !== confirm.goal.id &&
                g.municipality === confirm.goal.municipality &&
                g.year === confirm.goal.year &&
                g.indicator === confirm.goal.indicator
            )
          ) {
            toast.error(
              'Já existe uma meta ativa para este município, exercício e indicador.'
            );
            return;
          }
          if (
            save(
              confirm.action === 'delete'
                ? items.filter((g) => g.id !== confirm.goal.id)
                : items.map((g) =>
                    g.id === confirm.goal.id
                      ? { ...g, archived: !g.archived }
                      : g
                  )
            )
          )
            toast.success('Meta atualizada.');
        }}
      />
    </>
  );
}