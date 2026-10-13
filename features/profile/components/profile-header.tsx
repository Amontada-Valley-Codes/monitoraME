"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil da Empresa</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada dos dados cadastrais e preferências utilizadas pela plataforma.
        </p>
      </div>
    </div>
  );
}
