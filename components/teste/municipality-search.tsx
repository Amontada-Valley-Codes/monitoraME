"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TCE_MUNICIPALITIES } from "@/features/analytics/pipeline/municipalities";
import { testeContent as c } from "./content";

const connectorWords = new Set(["DA", "DAS", "DE", "DO", "DOS", "E"]);
const municipalities = TCE_MUNICIPALITIES.map((municipality) => ({
  ...municipality,
  label: municipality.name.split(" ").map((word, index) =>
    index > 0 && connectorWords.has(word) ? word.toLowerCase() : `${word.charAt(0)}${word.slice(1).toLowerCase()}`,
  ).join(" "),
}));

export function MunicipalitySearch() {
  const router = useRouter();
  const [municipality, setMunicipality] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const selected = municipalities.find((item) => item.code === municipality);
  const labels = c.social.municipality;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setError(labels.error);
      return;
    }
    setError("");
    const year = String(new Date().getFullYear());
    const params = new URLSearchParams({
      municipality_tce_code: selected.code,
      start_date: `${year}-01-01`,
      end_date: `${year}-12-31`,
    });
    router.push(`/analitico/municipios?${params.toString()}`);
  }

  return <form className="teste-municipality-form" onSubmit={submit} noValidate>
    <div className="teste-municipality-field">
      <label htmlFor="teste-municipality">{labels.label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id="teste-municipality" type="button" variant="outline" role="combobox" aria-expanded={open} aria-invalid={Boolean(error)} aria-describedby={error ? "teste-municipality-error" : undefined} className="teste-municipality-trigger h-12 w-full justify-between rounded-full px-4 font-normal">
            <span className="flex min-w-0 items-center gap-3"><MapPin className="size-4 shrink-0" /><span className="truncate">{selected?.label ?? labels.placeholder}</span></span>
            <ChevronsUpDown className="size-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="teste-municipality-popover w-(--radix-popover-trigger-width) overflow-hidden p-0" align="start">
          <Command><CommandInput placeholder={labels.searchPlaceholder} /><CommandList className="max-h-72"><CommandEmpty>{labels.empty}</CommandEmpty><CommandGroup heading={labels.group}>
            {municipalities.map((item) => <CommandItem key={item.code} value={`${item.label} ${item.code}`} onSelect={() => { setMunicipality(item.code); setOpen(false); setError(""); }} className="py-2.5">
              <Check className={`size-4 ${municipality === item.code ? "opacity-100" : "opacity-0"}`} /><span className="min-w-0 flex-1 truncate">{item.label}</span><span className="font-mono text-[10px] text-muted-foreground">{item.code}</span>
            </CommandItem>)}
          </CommandGroup></CommandList></Command>
        </PopoverContent>
      </Popover>
      {error && <p id="teste-municipality-error" role="alert" className="teste-municipality-error">{error}</p>}
    </div>
    <Button type="submit" className="teste-municipality-submit h-12 rounded-full px-6">{labels.submit}<ArrowUpRight className="size-4" /></Button>
  </form>;
}
