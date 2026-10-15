import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  usedCount: number;
  maxLimit: number;
}

export function CreateSearchModal({ open, onOpenChange, value, onChange, onSubmit, usedCount, maxLimit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Nova Busca Salva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Salvar Nova Busca no Radar</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2 text-sm">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Título da Busca</label>
            <Input placeholder="Ex: Editais em Amontada acima de 50000" value={value} onChange={(e) => onChange(e.target.value)} required />
            <p className="text-[11px] text-muted-foreground mt-1">O sistema identifica dinamicamente os filtros com base no título.</p>
          </div>

          {usedCount >= maxLimit && (
            <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2 rounded">
              <AlertCircle className="w-4 h-4" /> Limite do plano atingido ({maxLimit} buscas).
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={usedCount >= maxLimit} className="bg-emerald-600 text-white">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
