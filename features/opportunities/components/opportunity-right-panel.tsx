"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function OpportunityRightPanel() {
  const [showProCard, setShowProCard] = useState(true);

  if (!showProCard) return null;

  return (
    <aside className="hidden w-80 shrink-0 border-l bg-background px-5 py-6 lg:block 2xl:w-96 2xl:px-6">
      <div className="sticky top-6">
        <Card className="relative gap-4 py-5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-3 top-3 z-10"
            aria-label="Fechar card Conhecer planos Pro"
            onClick={() => setShowProCard(false)}
          >
            <X className="size-4" />
          </Button>
          <CardHeader className="px-5 pr-12">
            <CardTitle className="text-lg">Inteligência MonitoraME Pro</CardTitle>
            <CardDescription className="leading-relaxed">
              Dados do PNCP são 100% livres e públicos. Tenha IA para resumir
              exigências de habilitação, pipeline Kanban de propostas e radar de
              concorrentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <Button>Conhecer planos Pro</Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
