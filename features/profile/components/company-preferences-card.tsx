import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyProfileEntity } from "../domain/types";

export function CompanyPreferencesCard({ profile }: { profile: CompanyProfileEntity }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Preferências de Oportunidades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs">Municípios de Interesse</span>
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
