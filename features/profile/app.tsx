"use client";

import { useCompanyProfile } from "./hooks/use-company-profile";
import { ProfileHeader } from "./components/profile-header";
import { CompanyCadastralCard } from "./components/company-cadastral-card";
import { CompanyLocationCard } from "./components/company-location-card";
import { CompanyPreferencesCard } from "./components/company-preferences-card";
import { CompanyAccessCard } from "./components/company-access-card";
import { CNAEItem } from "./domain/types";
import { Info } from "lucide-react";

export default function ProfileApp() {
  const { profile, loading, saving, error, savePreferences } = useCompanyProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        A carregar dados demonstrativos da empresa...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-destructive">
        Erro ao carregar o perfil: {error}
      </div>
    );
  }

  const handleSaveCnaes = async (cnaes: CNAEItem[]) => {
    await savePreferences({ cnaes, municipiosInteresse: profile.municipiosInteresse });
  };

  const handleSaveMunicipios = async (municipiosInteresse: string[]) => {
    await savePreferences({ cnaes: profile.cnaes, municipiosInteresse });
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
      <ProfileHeader profile={profile} />

      <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.05] px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <strong className="font-semibold text-foreground">Ambiente demonstrativo.</strong>{' '}
          Os dados abaixo são exemplos tipados e não representam uma consulta oficial à Receita Federal.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <CompanyCadastralCard profile={profile} />
          <CompanyLocationCard profile={profile} onSaveCnaes={handleSaveCnaes} saving={saving} />
        </div>

        <div className="space-y-5 lg:col-span-5">
          <CompanyAccessCard profile={profile} />
          <CompanyPreferencesCard profile={profile} onSaveMunicipios={handleSaveMunicipios} saving={saving} />
        </div>
      </div>
    </main>
  );
}
