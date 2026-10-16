import { useState, useEffect, useCallback } from "react";
import { CompanyProfileEntity, UpdatePreferencesDTO } from "../domain/types";
import { MockCompanyProfileRepository } from "../infrastructure/mock-company-profile.repository";

const repository = new MockCompanyProfileRepository();

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfileEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repository.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const savePreferences = async (dto: UpdatePreferencesDTO) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await repository.updatePreferences(dto);
      setProfile(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar preferências");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, saving, error, savePreferences };
}
