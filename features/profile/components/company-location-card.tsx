import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyProfileEntity } from "../domain/types";

export function CompanyLocationCard({ profile }: { profile: CompanyProfileEntity }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Localização e Atuação (CNAEs)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs">Município</span>
          <p className="font-medium">{profile.municipio} - {profile.uf} (IBGE: {profile.codigoIbge})</p>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">CNAEs Atendidos</span>
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
