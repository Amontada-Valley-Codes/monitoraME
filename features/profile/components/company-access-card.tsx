import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyProfileEntity } from "../domain/types";

export function CompanyAccessCard({ profile }: { profile: CompanyProfileEntity }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Situação do Acesso e Plano</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs">Status do Acesso</span>
          <Badge className="mt-1 bg-emerald-600 text-white">{profile.situacao}</Badge>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Plano Demonstrado</span>
          <p className="font-medium">{profile.plano} ({profile.valorPlano})</p>
        </div>
      </CardContent>
    </Card>
  );
}
