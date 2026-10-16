"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyProfileEntity, CNAEItem } from "../domain/types";
import { EditCnaesModal } from "./edit-cnaes-modal";

interface Props {
  profile: CompanyProfileEntity;
  onSaveCnaes: (cnaes: CNAEItem[]) => Promise<void>;
  saving: boolean;
}

export function CompanyLocationCard({ profile, onSaveCnaes, saving }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Localização e Atuação (CNAEs)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs">Município</span>
          <p className="font-medium">{profile.municipio} - {profile.uf} (IBGE: {profile.codigoIbge})</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground block text-xs">CNAEs Atendidos</span>
            <EditCnaesModal
              cnaesAtuais={profile.cnaes}
              onSave={onSaveCnaes}
              saving={saving}
            />
          </div>
          <div className="space-y-1 mt-1">
            {profile.cnaes.map((cnae) => (
              <div key={cnae.codigo} className="text-xs">
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{cnae.codigo}</span> - {cnae.descricao}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
