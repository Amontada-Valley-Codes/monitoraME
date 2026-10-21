"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, CheckCircle2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyProfileEntity } from "../domain/types";

export function ProfileHeader({ profile }: { profile: CompanyProfileEntity }) {
  const router = useRouter();

  return (
    <header className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="h-1.5 bg-primary" />
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-1 size-4" />
            Voltar
          </Button>
          <Badge variant="outline" className="border-primary/20 bg-primary/[0.06] text-primary">
            Perfil empresarial
          </Badge>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {profile.nomeFantasia}
              </h1>
              <Badge className="gap-1 bg-success-soft text-success hover:bg-success-soft">
                <CheckCircle2 className="size-3" /> Validada
              </Badge>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{profile.razaoSocial}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="font-mono">CNPJ {profile.cnpj}</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {profile.municipio}/{profile.uf}
              </span>
              <span>{profile.porte}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
