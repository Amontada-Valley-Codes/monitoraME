"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import { CompanyProfileEntity, CNAEItem } from "../domain/types";
import { EditCnaesModal } from "./edit-cnaes-modal";

interface Props {
  profile: CompanyProfileEntity;
  onSaveCnaes: (cnaes: CNAEItem[]) => Promise<void>;
  saving: boolean;
}

export function CompanyLocationCard({ profile, onSaveCnaes, saving }: Props) {
  return (
    <Card className="gap-5 overflow-hidden pt-0 shadow-none">
      <div className="h-1 bg-primary" aria-hidden="true" />
      <CardHeader className="px-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <BriefcaseBusiness className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Atuação empresarial</CardTitle>
                <CardDescription className="mt-1">Localização e atividades usadas na compatibilidade.</CardDescription>
              </div>
              <EditCnaesModal cnaesAtuais={profile.cnaes} onSave={onSaveCnaes} saving={saving} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5 sm:px-6">
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
          <MapPin className="size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">{profile.municipio}/{profile.uf}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Código IBGE {profile.codigoIbge}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">CNAEs monitorados</p>
          <div className="divide-y rounded-xl border">
            {profile.cnaes.map((cnae) => (
              <div key={cnae.codigo} className="flex gap-3 p-3 text-xs">
                <span className="shrink-0 font-mono font-semibold text-primary">{cnae.codigo}</span>
                <span className="leading-relaxed text-muted-foreground">{cnae.descricao}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
