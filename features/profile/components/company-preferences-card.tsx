"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyProfileEntity } from "../domain/types";
import { EditMunicipiosModal } from "./edit-municipios-modal";

interface Props {
  profile: CompanyProfileEntity;
  onSaveMunicipios: (municipios: string[]) => Promise<void>;
  saving: boolean;
}

export function CompanyPreferencesCard({ profile, onSaveMunicipios, saving }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Preferências de Oportunidades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground block text-xs">Municípios de Interesse</span>
            <EditMunicipiosModal
              municipiosAtuais={profile.municipiosInteresse}
              onSave={onSaveMunicipios}
              saving={saving}
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {profile.municipiosInteresse.map((mun) => (
              <Badge key={mun} variant="secondary" className="text-xs">{mun}</Badge>
            ))}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Modalidades Preferidas</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {profile.modalidadesPreferidas.map((mod) => (
              <Badge key={mod} variant="outline" className="text-xs">{mod}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
