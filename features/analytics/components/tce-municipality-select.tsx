'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  getTceMunicipality,
  TCE_MUNICIPALITIES,
} from '../pipeline/municipalities';

interface TceMunicipalitySelectProps {
  value?: string;
  onValueChange: (code: string | undefined) => void;
  className?: string;
}

export function TceMunicipalitySelect({
  value,
  onValueChange,
  className,
}: TceMunicipalitySelectProps) {
  const [open, setOpen] = useState(false);
  const selected = getTceMunicipality(value);

  function select(code: string | undefined) {
    onValueChange(code);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="overview-municipality"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar município"
          className={cn('w-full min-w-0 justify-between bg-card', className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="truncate">
              {selected ? `${selected.name}` : 'Todos os municípios'}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Pesquisar por nome ou código..." />
          <CommandList>
            <CommandEmpty>Município não encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="todos os municipios" onSelect={() => select(undefined)}>
                <Check className={cn('size-4', value ? 'opacity-0' : 'opacity-100')} />
                Todos os municípios
              </CommandItem>
              {TCE_MUNICIPALITIES.map((municipality) => (
                <CommandItem
                  key={municipality.code}
                  value={`${municipality.name} ${municipality.code}`}
                  onSelect={() => select(municipality.code)}
                >
                  <Check
                    className={cn(
                      'size-4',
                      value === municipality.code ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{municipality.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {municipality.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
