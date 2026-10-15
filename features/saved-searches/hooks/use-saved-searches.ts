import { useState, useEffect, useCallback } from "react";
import { MockSavedSearchesRepository } from "../infrastructure/mock-saved-searches.repository";
import { SavedSearchEntity } from "../domain/types";

const repository = new MockSavedSearchesRepository();

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearchEntity[]>([]);
  const [maxLimit, setMaxLimit] = useState(30);
  const [usedCount, setUsedCount] = useState(0);
  const [planName, setPlanName] = useState("Equipe");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSearches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repository.getSearches();
      const sanitized = data.searches.map(s => ({
        ...s,
        filters: s.filters || {}
      }));
      setSearches(sanitized);
      setMaxLimit(data.maxLimit);
      setUsedCount(data.usedCount);
      if (data.planName) setPlanName(data.planName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar buscas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  const createSearch = async (name: string, filters: SavedSearchEntity["filters"]) => {
    try {
      setError(null);
      const res = await repository.createSearch(name, filters);
      setSearches(res.searches.map(s => ({ ...s, filters: s.filters || {} })));
      setUsedCount(res.usedCount);
      if (res.planName) setPlanName(res.planName);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar busca");
      return false;
    }
  };

  const updateSearch = async (id: string, name: string, filters: SavedSearchEntity["filters"]) => {
    const updated = await repository.updateSearch(id, name, filters);
    setSearches(updated.map(s => ({ ...s, filters: s.filters || {} })));
  };

  const removeSearch = async (id: string) => {
    const res = await repository.deleteSearch(id);
    setSearches(res.searches.map(s => ({ ...s, filters: s.filters || {} })));
    setUsedCount(res.usedCount);
    if (res.planName) setPlanName(res.planName);
  };

  return { searches, maxLimit, usedCount, planName, loading, error, createSearch, updateSearch, removeSearch };
}
