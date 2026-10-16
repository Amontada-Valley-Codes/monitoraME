"use client";

import { useState } from "react";
import {
  Download,
  FileDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import type { Filters } from "@/features/analytics/data/types";
import {
  makeExport,
  downloadBlob,
  type ExportDataset,
} from "@/shared/lib/export";

import { useSession } from "@/shared/auth/session-context";

const EXPORT_FEATURE = {
  name: "Exportação de dados",
  description: "Baixe o recorte selecionado em PDF, CSV ou Excel, com filtros e procedência dos dados.",
};

interface ExportButtonProps {
  dataset: ExportDataset;
  filters?: Filters;
  compact?: boolean;
}

export function ExportButton({
  dataset,
  filters,
  compact = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"pdf" | "csv" | "xlsx">("xlsx");
  const [busy, setBusy] = useState(false);
  const { status, accountRole } = useSession();
  const canExport = status === "authenticated" && accountRole === "PERSON";

  function handleExportClick() {
    if (!canExport) return;
    setOpen(true);
  }

  async function run() {
    setBusy(true);

    try {
      const blob = await makeExport(
        format,
        dataset,
        filters
      );

      downloadBlob(
        blob,
        `MonitoraME_${dataset.title.replaceAll(" ", "_")}_${filters?.start ?? "recorte"}.${format}`
      );

      toast.success(
        "Arquivo exportado com os filtros e a procedência dos dados."
      );

      setOpen(false);
    } catch {
      toast.error(
        "Não foi possível exportar. Tente novamente."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!canExport) return null;

  return (
    <>
      <Button
        title={EXPORT_FEATURE.name}
        variant={compact ? "outline" : "default"}
        onClick={handleExportClick}
        disabled={!dataset.rows.length}
      >
        <Download className="size-4" />

        {compact ? "Exportar" : "Exportar dados"}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) {
            setOpen(value);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Exportar {dataset.title.toLowerCase()}
            </DialogTitle>

            <DialogDescription>
              {dataset.rows.length.toLocaleString("pt-BR")}{" "}
              registros do recorte global. Inclui período,
              elemento de despesa, porte, origem e procedência.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup
            value={format}
            onValueChange={(value) =>
              setFormat(value as typeof format)
            }
            className="gap-3 py-4"
          >
            {[
              {
                id: "xlsx",
                name: "Excel (.xlsx)",
                text: "Dados numéricos + aba de procedência.",
              },
              {
                id: "csv",
                name: "CSV (.csv)",
                text: "UTF-8, separado por ponto e vírgula.",
              },
              {
                id: "pdf",
                name: "PDF (.pdf)",
                text: "Relatório paginado com todos os registros.",
              },
            ].map((file) => (
              <Label
                key={file.id}
                className="flex cursor-pointer gap-3 rounded-lg border p-4"
              >
                <RadioGroupItem value={file.id} />

                <FileDown className="size-5 text-primary" />

                <span>
                  {file.name}

                  <span className="mt-1 block text-sm font-normal text-muted-foreground">
                    {file.text}
                  </span>
                </span>
              </Label>
            ))}
          </RadioGroup>

          <p className="text-xs text-muted-foreground">
            Os arquivos identificam explicitamente esta base
            como demonstração.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              disabled={busy}
              onClick={run}
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}

              {busy
                ? "Gerando arquivo..."
                : "Baixar arquivo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
