'use client';

import { useState } from 'react';
import { Download, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Filters } from '@/features/analytics/data/types';
import { makeExport, downloadBlob, type ExportDataset } from '@/shared/lib/export';

export function ExportButton({ dataset, filters, compact = false }: { dataset: ExportDataset; filters: Filters; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'csv' | 'xlsx'>('xlsx');
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const blob = await makeExport(format, dataset, filters);
      downloadBlob(blob, `MonitoraME_${dataset.title.replaceAll(' ', '_')}_${filters.start}.${format}`);
      toast.success('Arquivo exportado com os filtros e a procedência dos dados.');
      setOpen(false);
    } catch {
      toast.error('Não foi possível exportar. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return <><Button variant={compact ? 'outline' : 'default'} onClick={() => setOpen(true)} disabled={!dataset.rows.length}><Download className="size-4" />{compact ? 'Exportar' : 'Exportar dados'}</Button><Dialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value); }}><DialogContent><DialogHeader><DialogTitle>Exportar {dataset.title.toLowerCase()}</DialogTitle><DialogDescription>{dataset.rows.length.toLocaleString('pt-BR')} registros do recorte global. Inclui período, elemento de despesa, porte, origem e procedência.</DialogDescription></DialogHeader><RadioGroup value={format} onValueChange={(value) => setFormat(value as typeof format)} className="gap-3 py-4">{[{ id: 'xlsx', name: 'Excel (.xlsx)', text: 'Dados numéricos + aba de procedência.' }, { id: 'csv', name: 'CSV (.csv)', text: 'UTF-8, separado por ponto e vírgula.' }, { id: 'pdf', name: 'PDF (.pdf)', text: 'Relatório paginado com todos os registros.' }].map((file) => <Label key={file.id} className="flex cursor-pointer gap-3 rounded-lg border p-4"><RadioGroupItem value={file.id} /><FileDown className="size-5 text-primary" /><span>{file.name}<span className="mt-1 block text-sm font-normal text-muted-foreground">{file.text}</span></span></Label>)}</RadioGroup><p className="text-xs text-muted-foreground">Os arquivos identificam explicitamente esta base como demonstração.</p><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={busy} onClick={run}>{busy ? <Loader2 className="animate-spin" /> : <Download />}{busy ? 'Gerando arquivo...' : 'Baixar arquivo'}</Button></DialogFooter></DialogContent></Dialog></>;
}
