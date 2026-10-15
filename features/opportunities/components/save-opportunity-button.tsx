"use client";

import { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveOpportunity } from "../saved-opportunities";
import type { Opportunity } from "../types";

export function SaveOpportunityButton({
  opportunity,
  compact = false,
  className,
}: {
  opportunity: Opportunity;
  compact?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveOpportunity(opportunity);
    setSaved(true);
  }

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon-sm" : "default"}
      className={cn(saved && "text-primary", className)}
      aria-label={compact ? "Salvar edital no Kanban" : undefined}
      onClick={handleSave}
    >
      {saved ? (
        <Check className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {!compact && (saved ? "Edital salvo" : "Salvar Edital")}
    </Button>
  );
}