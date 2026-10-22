"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CNAEItem } from "../domain/types";
import { X, Plus, Loader2, Edit2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CnaeIBGE {
  id: string;
  descricao: string;
}

interface Props {
  cnaesAtuais: CNAEItem[];
  onSave: (cnaes: CNAEItem[]) => Promise<void>;
  saving: boolean;
}

export function EditCnaesModal({ cnaesAtuais, onSave, saving }: Props) {
  const [open, setOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [cnaes, setCnaes] = useState<CNAEItem[]>(cnaesAtuais);
  const [selectedCnae, setSelectedCnae] = useState<CnaeIBGE | null>(null);
  
  const [listaCnaes, setListaCnaes] = useState<CnaeIBGE[]>([]);
  const [loadingIbge, setLoadingIbge] = useState(false);

  useEffect(() => {
    if (open && listaCnaes.length === 0) {
      const controller = new AbortController();
      const frame = requestAnimationFrame(() => setLoadingIbge(true));
      fetch("https://servicodados.ibge.gov.br/api/v2/cnae/classes", { signal: controller.signal })
        .then((res) => res.json())
        .then((data: CnaeIBGE[]) => {
          setListaCnaes(data);
          setLoadingIbge(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setListaCnaes([
            { id: "6201501", descricao: "Desenvolvimento de programas de computador sob encomenda" },
            { id: "6204000", descricao: "Consultoria em tecnologia da informação" },
            { id: "4651601", descricao: "Comércio atacadista de equipamentos de informática" }
          ]);
          setLoadingIbge(false);
        });
      return () => { cancelAnimationFrame(frame); controller.abort(); };
    }
  }, [open, listaCnaes.length]);

  const handleRemove = (codigo: string) => {
    setCnaes(cnaes.filter((c) => c.codigo !== codigo));
  };

  const handleAdd = () => {
    if (!selectedCnae) return;
    const rawId = selectedCnae.id.replace(/\D/g, "");
    let codigoFormatado = rawId;
    if (rawId.length === 7) {
      codigoFormatado = `${rawId.slice(0, 4)}-${rawId.slice(4, 5)}/${rawId.slice(5)}`;
    }

    if (cnaes.some((c) => c.codigo === codigoFormatado)) return;

    setCnaes([
      ...cnaes,
      { codigo: codigoFormatado, descricao: selectedCnae.descricao },
    ]);
    setSelectedCnae(null);
  };

  const handleSave = async () => {
    await onSave(cnaes);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setCnaes(cnaesAtuais);
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary/80">
          <Edit2 className="w-3 h-3 mr-1" /> Alterar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Alterar CNAEs Atendidos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3 text-sm">
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border rounded-md">
            {cnaes.map((cnae) => (
              <Badge key={cnae.codigo} variant="secondary" className="px-2.5 py-1 text-xs flex items-center gap-1">
                <span className="font-mono font-bold text-primary">{cnae.codigo}</span>
                <span className="max-w-40 truncate">{cnae.descricao}</span>
                <button type="button" onClick={() => handleRemove(cnae.codigo)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="pt-2 border-t flex items-center gap-2">
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="flex-1 w-0 min-w-0 justify-between h-auto py-2 text-xs font-normal px-3 items-start"
                >
                  <span className="whitespace-normal text-left w-full wrap-break-word pr-2">
                    {selectedCnae
                      ? `${selectedCnae.id} - ${selectedCnae.descricao}`
                      : loadingIbge
                      ? "A carregar CNAEs..."
                      : "Pesquisar por código ou atividade..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 mt-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-87.5 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Digite o código ou nome..." className="text-xs h-9" />
                  <CommandList>
                    <CommandEmpty>Nenhuma atividade encontrada.</CommandEmpty>
                    <CommandGroup>
                      {listaCnaes.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.id} ${item.descricao}`}
                          onSelect={() => {
                            setSelectedCnae(item);
                            setComboboxOpen(false);
                          }}
                          className="text-xs"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3.5 w-3.5 shrink-0",
                              selectedCnae?.id === item.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="mr-1 shrink-0 font-mono font-bold text-primary">{item.id}</span>
                          <span className="truncate">{item.descricao}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button type="button" variant="outline" size="sm" onClick={handleAdd} disabled={loadingIbge || !selectedCnae} className="h-9 text-xs shrink-0 px-3 self-center">
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" disabled={saving} onClick={handleSave} >
            {saving && <Loader2 className="w-3 h-3 mr-2 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
