"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar } from "lucide-react";
import { CompanyProfileEntity } from "../domain/types";
import { EditMunicipiosModal } from "./edit-municipios-modal";

interface Props {
  profile: CompanyProfileEntity;
  onSaveMunicipios: (municipios: string[]) => Promise<void>;
  saving: boolean;
}

export function CompanyPreferencesCard({ profile, onSaveMunicipios, saving }: Props) {
  return (
    <Card className="gap-5 overflow-hidden pt-0 shadow-none">
      <div className="h-1 bg-primary" aria-hidden="true" />
      <CardHeader className="px-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <Radar className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Radar de oportunidades</CardTitle>
            <CardDescription className="mt-1">Preferências usadas para organizar recomendações.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5 text-sm sm:px-6">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Municípios de interesse</span>
            <EditMunicipiosModal
              municipiosAtuais={profile.municipiosInteresse}
              onSave={onSaveMunicipios}
              saving={saving}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.municipiosInteresse.map((mun) => (
              <Badge key={mun} variant="secondary" className="px-2.5 py-1 text-xs">{mun}</Badge>
            ))}
          </div>
        </div>
        <div className="border-t pt-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Modalidades preferidas</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.modalidadesPreferidas.map((mod) => (
              <Badge key={mod} variant="outline" className="px-2.5 py-1 text-xs">{mod}</Badge>
            ))}
          </div>
        </div>
        <p className="rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
          Essas preferências auxiliam a descoberta. Elegibilidade e compatibilidade continuam sendo validadas pelos serviços responsáveis.
        </p>
      </CardContent>
    </Card>
  );
}
