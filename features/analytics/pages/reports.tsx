'use client';

import { useState } from 'react';
import { Plus, FolderOpen, Pencil, Archive, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

import { localId } from '@/shared/lib/local-id';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { useAnalytics } from '../data/context';
import { exportDataset } from '../data/export-datasets';
import { ExportButton } from '@/shared/components/export-button';
import { SelectField } from '@/shared/components/select-field';
import { useLocalCollection } from '@/shared/lib/use-local-collection';
import { ConfirmAction } from '@/shared/components/confirm-action';
import { DataTable, type Column } from '@/shared/components/data-table';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { dateLabel } from '@/shared/lib/format';
import type { SavedReport } from '../data/types';
import { DEFAULT_FILTERS } from '../data/fixtures';

const initial: SavedReport[] = [
  {
    id: 'r1',
    name: 'Panorama anual · Ceará',
    description: 'Participação de ME e retenção econômica em 2025.',
    filters: DEFAULT_FILTERS,
    group: 'municipios',
    createdAt: '2026-09-10',
    archived: false,
  },
];

export default function Reports() {
  const { data, state, reload, filters, setFilters } = useAnalytics();
  const { items, save } = useLocalCollection<SavedReport>('monitorame.reports.v1', initial);

  const [group, setGroup] = useState<SavedReport['group']>('municipios');
  const [tab, setTab] = useState('generate');
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SavedReport>(initial[0]);
  const [useCurrent, setUseCurrent] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{
    report: SavedReport;
    action: 'archive' | 'delete';
  } | null>(null);

  const dataset = data ? exportDataset(data, group) : null;

  function edit(report?: SavedReport) {
    setDraft(
      report ?? {
        id: '',
        name: '',
        description: '',
        filters,
        group,
        createdAt: new Date().toISOString().slice(0, 10),
        archived: false,
      },
    );
    setUseCurrent(!report);
    setError('');
    setOpen(true);
  }

  function submit() {
    if (!draft.name.trim()) {
      setError('Dê um nome ao relatório.');
      return;
    }

    const next = {
      ...draft,
      name: draft.name.trim(),
      filters: useCurrent ? filters : draft.filters,
      group: useCurrent ? group : draft.group,
      id: draft.id || localId(),
    };

    if (save(draft.id ? items.map((r) => (r.id === draft.id ? next : r)) : [...items, next])) {
      setOpen(false);
      toast.success('Relatório salvo neste navegador.');
    }
  }

  const columns: Column<SavedReport>[] = [
    {
      key: 'name',
      label: 'Relatório',
      get: (r) => r.name,
      render: (r) => (
        <div>
          <span className="font-medium">{r.name}</span>
          <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Período',
      get: (r) => r.filters.start,
      render: (r) => (
        <span className="text-sm">
          {dateLabel(r.filters.start)} a {dateLabel(r.filters.end)}
        </span>
      ),
    },
    {
      key: 'group',
      label: 'Agrupamento',
      get: (r) => r.group,
    },
    {
      key: 'created',
      label: 'Criado em',
      get: (r) => r.createdAt,
      render: (r) => dateLabel(r.createdAt),
    },
    {
      key: 'actions',
      label: 'Ações',
      get: (r) => r.id,
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Abrir ${r.name}`}
            onClick={() => {
              setFilters(r.filters);
              setGroup(r.group);
              setTab('generate');
              toast.success('Recorte do relatório carregado.');
            }}
          >
            <Play className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${r.name}`}
            onClick={() => edit(r)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${r.archived ? 'Restaurar' : 'Arquivar'} ${r.name}`}
            onClick={() => setConfirm({ report: r, action: 'archive' })}
          >
            <Archive className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${r.name}`}
            onClick={() => setConfirm({ report: r, action: 'delete' })}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const activeFilters = useCurrent ? filters : draft.filters;
  const activeGroup = useCurrent ? group : draft.group;

  const confirmTitle =
    confirm?.action === 'delete'
      ? 'Excluir relatório?'
      : confirm?.report.archived
        ? 'Restaurar relatório?'
        : 'Arquivar relatório?';

  return (
    <>
      <PageHeader
        eyebrow="Análises para compartilhar"
        title="Relatórios"
        description="Prepare recortes, exporte dados e salve configurações para consultar novamente."
        actions={
          <Button onClick={() => edit()}>
            <Plus />
            Salvar relatório
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="generate">Gerar relatório</TabsTrigger>
          <TabsTrigger value="saved">
            <FolderOpen className="size-4" />
            Relatórios salvos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <GlobalFilters />

          <div className="panel p-5 flex flex-wrap justify-between gap-4 mb-6 items-end">
            <div>
              <Label className="mb-2">Agrupar dados por</Label>
              <SelectField
                label="Agrupamento do relatório"
                value={group}
                onChange={(v) => setGroup(v as typeof group)}
                options={[
                  { value: 'municipios', label: 'Municípios' },
                  { value: 'despesas', label: 'Notas de empenho' },
                  { value: 'fornecedores', label: 'Fornecedores' },
                ]}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {dataset?.rows.length.toLocaleString('pt-BR') ?? '—'} registros no arquivo completo
            </p>
            {dataset && <ExportButton dataset={dataset} filters={filters} />}
          </div>

          {state === 'loading' ? (
            <LoadingState />
          ) : state === 'error' ? (
            <ErrorState onRetry={reload} />
          ) : (
            dataset && (
              <section className="panel overflow-hidden">
                <div className="p-5">
                  <h2 className="font-semibold">Prévia do relatório</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Até 8 registros. A exportação contém todos os registros do recorte.
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {dataset.columns.map((c) => (
                        <TableHead key={c}>{c}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataset.rows.slice(0, 8).map((row, i) => (
                      <TableRow key={i}>
                        {row.map((v, j) => (
                          <TableCell key={j} className="text-sm">
                            {typeof v === 'number'
                              ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
                              : v}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!dataset.rows.length && (
                  <p className="p-6 text-muted-foreground">Sem dados no recorte selecionado.</p>
                )}
              </section>
            )
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Label className="flex gap-2 items-center mb-4">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} />
            Mostrar arquivados
          </Label>
          <DataTable
            rows={items.filter((r) => r.archived === showArchived)}
            columns={columns}
            title="Configurações de relatório"
            searchPlaceholder="Buscar relatório..."
          />
        </TabsContent>
      </Tabs>

      <p className="mt-5 text-xs text-muted-foreground">
        Relatórios salvos pertencem a este navegador. Não há filtro de responsável ou secretaria:
        estes campos não integram o escopo analítico.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Editar relatório' : 'Salvar configuração de relatório'}</DialogTitle>
            <DialogDescription>
              Guarda o recorte e o agrupamento, sem duplicar os registros públicos.
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
              <Label htmlFor="report-name" className="mb-2">
                Nome
              </Label>
              <Input
                id="report-name"
                value={draft.name}
                maxLength={80}
                required
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                aria-invalid={!!error}
              />
            </div>

            <div>
              <Label htmlFor="report-description" className="mb-2">
                Descrição
              </Label>
              <Textarea
                id="report-description"
                value={draft.description}
                maxLength={300}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>

            {draft.id && (
              <Label className="flex gap-3">
                <Checkbox checked={useCurrent} onCheckedChange={(v: boolean | "indeterminate") => setUseCurrent(!!v)} />
                Substituir o recorte pelos filtros atuais
              </Label>
            )}

            <p className="text-xs text-muted-foreground">
              {activeFilters.start} a {activeFilters.end} · {activeGroup}
            </p>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar configuração</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmAction
        open={!!confirm}
        onClose={() => setConfirm(null)}
        destructive={confirm?.action === 'delete'}
        title={confirmTitle}
        description="Esta ação afeta somente a configuração salva neste navegador."
        onConfirm={() => {
          if (!confirm) return;

          const next =
            confirm.action === 'delete'
              ? items.filter((r) => r.id !== confirm.report.id)
              : items.map((r) => (r.id === confirm.report.id ? { ...r, archived: !r.archived } : r));

          if (save(next)) toast.success('Relatório atualizado.');
        }}
      />
    </>
  );
}