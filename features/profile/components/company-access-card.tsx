import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { CompanyProfileEntity } from "../domain/types";

export function CompanyAccessCard({ profile }: { profile: CompanyProfileEntity }) {
  return (
    <Card className="gap-5 overflow-hidden pt-0 shadow-none">
      <div className="h-1 bg-primary" aria-hidden="true" />
      <CardHeader className="px-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Acesso e assinatura</CardTitle>
            <CardDescription className="mt-1">Situação demonstrativa da conta empresarial.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5 text-sm sm:px-6">
        <div className="flex items-start gap-3 rounded-xl bg-success-soft p-4 text-success">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Acesso ativo</p>
            <p className="mt-1 text-xs leading-relaxed">{profile.situacao}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-y py-4">
          <div className="flex items-center gap-3">
            <CreditCard className="size-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Plano demonstrado</p>
              <p className="mt-0.5 font-semibold">{profile.plano}</p>
            </div>
          </div>
          <Badge variant="secondary">{profile.valorPlano}</Badge>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/analitico/planos">Ver planos e recursos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
