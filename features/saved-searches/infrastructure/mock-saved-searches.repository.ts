import { companyDemoFixture } from "@/features/profile/infrastructure/company-demo-fixture";
import { SavedSearchEntity } from "../domain/types";


let mockSavedSearches: SavedSearchEntity[] = [
  { id: "1", name: "Software em Fortaleza", filters: { query: "Software", municipalities: ["Fortaleza"] }, createdAt: "2026-02-10" },
  { id: "2", name: "Consultoria TI Ceará", filters: { query: "Consultoria", cnaes: ["6204-0/00"] }, createdAt: "2026-02-12" },
  { id: "3", name: "Pregões de Informática", filters: { modalities: ["Pregão Eletrônico"], minValue: 20000 }, createdAt: "2026-02-15" },
  { id: "4", name: "Dispensa Eletrônica Capital", filters: { modalities: ["Dispensa Eletrônica"], municipalities: ["Fortaleza"] }, createdAt: "2026-02-18" },
  { id: "5", name: "Desenvolvimento Web", filters: { query: "Desenvolvimento" }, createdAt: "2026-02-20" },
  { id: "6", name: "Suporte Técnico Municipal", filters: { query: "Suporte" }, createdAt: "2026-02-22" },
  { id: "7", name: "Equipamentos TI Região", filters: { cnaes: ["4651-6/01"] }, createdAt: "2026-02-24" },
  { id: "8", name: "Licitações Acima de 50k", filters: { minValue: 50000 }, createdAt: "2026-02-25" },
];

function getPlanMaxLimit(planName: string): number {
  switch (planName.toLowerCase()) {
    case "essencial":
      return 10;
    case "equipe":
      return 30;
    case "degustação":
    case "gratuito":
      return 3;
    default:
      return 3;
  }
}

export class MockSavedSearchesRepository {
  async getSearches() {
    await new Promise((r) => setTimeout(r, 200));
    const maxLimit = getPlanMaxLimit(companyDemoFixture.plano);
    return {
      searches: [...mockSavedSearches],
      maxLimit,
      usedCount: mockSavedSearches.length,
      planName: companyDemoFixture.plano,
    };
  }

  async createSearch(name: string, filters: SavedSearchEntity["filters"]) {
    await new Promise((r) => setTimeout(r, 400));
    const maxLimit = getPlanMaxLimit(companyDemoFixture.plano);
    if (mockSavedSearches.length >= maxLimit) {
      throw new Error(`Limite de buscas salvas atingido para o plano ${companyDemoFixture.plano} (${maxLimit} buscas).`);
    }
    const newSearch: SavedSearchEntity = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString().split("T")[0],
    };
    mockSavedSearches.unshift(newSearch);
    return { 
      searches: [...mockSavedSearches], 
      usedCount: mockSavedSearches.length, 
      planName: companyDemoFixture.plano 
    };
  }

  async updateSearch(id: string, name: string, filters: SavedSearchEntity["filters"]) {
    await new Promise((r) => setTimeout(r, 300));
    mockSavedSearches = mockSavedSearches.map((s) => (s.id === id ? { ...s, name, filters } : s));
    return [...mockSavedSearches];
  }

  async deleteSearch(id: string) {
    await new Promise((r) => setTimeout(r, 300));
    mockSavedSearches = mockSavedSearches.filter((s) => s.id !== id);
    return { 
      searches: [...mockSavedSearches], 
      usedCount: mockSavedSearches.length, 
      planName: companyDemoFixture.plano 
    };
  }
}
