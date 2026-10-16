"use client";

import { useState } from "react";
import { useSavedSearches } from "./hooks/use-saved-searches";
import { parseFiltersFromName } from "./utils/parser";
import { SavedSearchCard } from "./components/saved-search-card";
import { CreateSearchModal } from "./components/create-search-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SavedSearchesApp() {
  const { searches, maxLimit, usedCount, planName, loading, error, createSearch, updateSearch, removeSearch } = useSavedSearches();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  const handleExecute = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.municipalities) params.set("mun", filters.municipalities.join(","));
    if (filters.cnaes) params.set("cnae", filters.cnaes.join(","));
    if (filters.modalities) params.set("mod", filters.modalities.join(","));
    if (filters.minValue) params.set("min", filters.minValue.toString());
    if (filters.maxValue) params.set("max", filters.maxValue.toString());
    router.push(`/oportunidades?${params.toString()}`);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSearchName) return;
    const extractedFilters = parseFiltersFromName(newSearchName);
    const success = await createSearch(newSearchName, extractedFilters);
    if (success) {
      setNewSearchName("");
      setOpenCreate(false);
    }
  };

  const handleUpdateSubmit = async (id: string) => {
    if (!newName) return;
    const updatedFilters = parseFiltersFromName(newName);
    await updateSearch(id, newName, updatedFilters);
    setEditingId(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-sm text-muted-foreground">A carregar buscas salvas...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground mb-1" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Buscas Salvas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie combinações de filtros do Radar para reutilização rápida sem alterar o seu perfil principal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-muted-foreground block">Uso do Plano ({planName})</span>
            <span className="font-semibold">{usedCount} de {maxLimit} utilizadas</span>
          </div>
          
          <CreateSearchModal
            open={openCreate}
            onOpenChange={setOpenCreate}
            value={newSearchName}
            onChange={setNewSearchName}
            onSubmit={handleCreateSubmit}
            usedCount={usedCount}
            maxLimit={maxLimit}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {searches.map((search) => (
          <SavedSearchCard
            key={search.id}
            search={search}
            isEditing={editingId === search.id}
            newName={newName}
            onNewNameChange={setNewName}
            onStartEdit={() => { setEditingId(search.id); setNewName(search.name); }}
            onSaveEdit={() => handleUpdateSubmit(search.id)}
            onDelete={() => removeSearch(search.id)}
            onExecute={() => handleExecute(search.filters)}
          />
        ))}
      </div>
    </div>
  );
}
