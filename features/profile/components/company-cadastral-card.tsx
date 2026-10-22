import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone } from "lucide-react";
import { CompanyProfileEntity } from "../domain/types";

export function CompanyCadastralCard({ profile }: { profile: CompanyProfileEntity }) {
  return (
    <Card className="gap-5 overflow-hidden pt-0 shadow-none">
      <div className="h-1 bg-primary" aria-hidden="true" />
      <CardHeader className="px-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <Building2 className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Dados cadastrais</CardTitle>
            <CardDescription className="mt-1">Identificação e canais de contato da empresa.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        <dl className="grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
          <ProfileField label="Razão social" value={profile.razaoSocial} className="sm:col-span-2" />
          <ProfileField label="Nome fantasia" value={profile.nomeFantasia} />
          <ProfileField label="CNPJ" value={profile.cnpj} mono />
          <ProfileField label="Porte empresarial" value={profile.porte} />
          <ProfileField label="Situação cadastral" value="Ativa (demonstração)" />
        </dl>

        <div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">
          <a href={`mailto:${profile.contato}`} className="flex min-w-0 items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm transition-colors hover:bg-muted">
            <Mail className="size-4 shrink-0 text-primary" />
            <span className="truncate">{profile.contato}</span>
          </a>
          <a href={`tel:${profile.telefone.replace(/\D/g, '')}`} className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm transition-colors hover:bg-muted">
            <Phone className="size-4 shrink-0 text-primary" />
            <span>{profile.telefone}</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileField({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
