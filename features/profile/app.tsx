"use client";

import { useCompanyProfile } from "./hooks/use-company-profile";
import { ProfileHeader } from "./components/profile-header";
import { CompanyCadastralCard } from "./components/company-cadastral-card";
import { CompanyLocationCard } from "./components/company-location-card";
import { CompanyPreferencesCard } from "./components/company-preferences-card";
import { CompanyAccessCard } from "./components/company-access-card";

export default function ProfileApp() {
  const { profile, loading, error } = useCompanyProfile();

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

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      <ProfileHeader />

      <div className="grid gap-6 md:grid-cols-2">
        <CompanyCadastralCard profile={profile} />
        <CompanyLocationCard profile={profile} />
        <CompanyPreferencesCard profile={profile} />
        <CompanyAccessCard profile={profile} />
      </div>
    </div>
  );
}
