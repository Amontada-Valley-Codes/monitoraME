import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyProfileEntity } from "../domain/types";

export function CompanyCadastralCard({ profile }: { profile: CompanyProfileEntity }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Dados Cadastrais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs">Razão Social / Nome Fantasia</span>
          <p className="font-medium">{profile.razaoSocial}</p>
          <p className="text-muted-foreground">{profile.nomeFantasia}</p>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">CNPJ</span>
          <p className="font-medium">{profile.cnpj}</p>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Porte</span>
          <p className="font-medium">{profile.porte}</p>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Contato</span>
          <p className="font-medium">{profile.contato} | {profile.telefone}</p>
        </div>
      </CardContent>
    </Card>
  );
}
