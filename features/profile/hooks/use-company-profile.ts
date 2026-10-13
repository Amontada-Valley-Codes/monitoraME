import { useState, useEffect } from "react";
import { CompanyProfileEntity } from "../domain/types";
import { MockCompanyProfileRepository } from "../infrastructure/mock-company-profile.repository";

const repository = new MockCompanyProfileRepository();

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfileEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    repository
      .getProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, loading, error };
}
