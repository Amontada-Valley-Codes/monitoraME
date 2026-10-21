"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { X, Plus, Loader2, Edit2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MunicipioIBGE {
  id: number;
  nome: string;
}

interface Props {
  municipiosAtuais: string[];
  onSave: (municipios: string[]) => Promise<void>;
  saving: boolean;
}

export function EditMunicipiosModal({ municipiosAtuais, onSave, saving }: Props) {
  const [open, setOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [municipios, setMunicipios] = useState<string[]>(municipiosAtuais);
  const [selectedMun, setSelectedMun] = useState("");
  
  const [listaMunicipios, setListaMunicipios] = useState<string[]>([]);
  const [loadingIbge, setLoadingIbge] = useState(false);

  // Busca os municípios do Ceará do IBGE
  useEffect(() => {
    if (open && listaMunicipios.length === 0) {
      const controller = new AbortController();
      const frame = requestAnimationFrame(() => setLoadingIbge(true));
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/CE/municipios?orderBy=nome", { signal: controller.signal })
        .then((res) => res.json())
        .then((data: MunicipioIBGE[]) => {
          const formatted = data.map((m) => m.nome);
          setListaMunicipios(formatted);
          setLoadingIbge(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setListaMunicipios(["Fortaleza", "Caucaia", "Maracanaú", "Sobral", "Itarema", "Acaraú"]);
          setLoadingIbge(false);
        });
      return () => { cancelAnimationFrame(frame); controller.abort(); };
    }
  }, [open, listaMunicipios.length]);

  const handleRemove = (mun: string) => {
    setMunicipios(municipios.filter((m) => m !== mun));
  };

  const handleAdd = () => {
    if (!selectedMun || municipios.includes(selectedMun)) return;
    setMunicipios([...municipios, selectedMun]);
    setSelectedMun("");
  };

  const handleSave = async () => {
    await onSave(municipios);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setMunicipios(municipiosAtuais);
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700">
          <Edit2 className="w-3 h-3 mr-1" /> Alterar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Municípios de Interesse</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3 text-sm">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border rounded-md">
            {municipios.map((mun) => (
              <Badge key={mun} variant="secondary" className="px-2.5 py-1 text-xs flex items-center gap-1">
                <span>{mun}</span>
                <button type="button" onClick={() => handleRemove(mun)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t flex gap-2 items-center">
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="flex-1 justify-between h-9 text-xs font-normal"
                >
                  {selectedMun ? selectedMun : loadingIbge ? "A carregar municípios..." : "Selecione o município..."}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-75 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Pesquisar município..." className="text-xs h-9" />
                  <CommandList>
                    <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
                    <CommandGroup>
                      {listaMunicipios.map((mun) => (
                        <CommandItem
                          key={mun}
                          value={mun}
                          onSelect={(currentValue) => {
                            // O Command value vem em minúsculas por padrão, garantimos o nome original
                            const original = listaMunicipios.find(m => m.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                            setSelectedMun(original);
                            setComboboxOpen(false);
                          }}
                          className="text-xs"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3.5 w-3.5",
                              selectedMun === mun ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {mun}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button type="button" variant="outline" size="sm" onClick={handleAdd} disabled={loadingIbge || !selectedMun} className="h-9 text-xs shrink-0">
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" disabled={saving} onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving && <Loader2 className="w-3 h-3 mr-2 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
