"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as PricingCard from "@/components/pricing-card";
import { Checkout } from "@/components/checkout/checkout";
import {
  CHECKOUT_PLANS,
  formatPlanPrice,
  type CheckoutPlan,
} from "@/components/checkout/plans";

const PLAN_ICONS = [Users, Sparkles, Building2];

export function PricingSection({
  onAccessPlatform,
}: {
  onAccessPlatform: () => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan | null>(null);

  if (selectedPlan) {
    return (
      <Checkout
        plan={selectedPlan}
        onExit={() => setSelectedPlan(null)}
        onAccessPlatform={onAccessPlatform}
      />
    );
  }

  return (
    <section className="relative flex w-full flex-1 flex-col justify-center overflow-hidden">
      <div className="mx-auto max-w-2xl text-center space-y-4">
        <div className="flex justify-center">
          <div className="eyebrow rounded-md border bg-card px-4 py-1 text-primary">
            Planos MonitoraME
          </div>
        </div>
        <h1 className="mt-2 mb-1 text-3xl font-bold tracking-tight md:text-4xl">
          Escolha o plano ideal para sua gestão
        </h1>
        <p className="mt-1 mb-4 text-sm leading-6 text-muted-foreground md:text-base">
          Acompanhe compras públicas com clareza, indicadores confiáveis e
          ferramentas que crescem com sua equipe.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-5 mt-6 md:grid-cols-3">
        {CHECKOUT_PLANS.map((plan, index) => {
          const Icon = PLAN_ICONS[index];

          return (
            <PricingCard.Card
              key={plan.id}
              className={cn(
                "max-w-full bg-card",
                plan.featured && "border-primary shadow-sm md:-translate-y-6",
              )}
            >
              <PricingCard.Header
                isPopular={plan.featured}
                className="rounded-lg border-0 bg-transparent"
              >
                <PricingCard.Plan>
                  <PricingCard.PlanName>
                    <Icon className="text-primary" />
                    <span>{plan.name}</span>
                  </PricingCard.PlanName>
                  {plan.badge && (
                    <PricingCard.Badge className="border-primary/20 bg-secondary text-primary">
                      {plan.badge}
                    </PricingCard.Badge>
                  )}
                </PricingCard.Plan>

                <PricingCard.Price>
                  <PricingCard.MainPrice className="metric">
                    {formatPlanPrice(plan.priceInCents)}
                  </PricingCard.MainPrice>
                  <PricingCard.Period>/mês</PricingCard.Period>
                  {plan.originalPriceInCents && (
                    <PricingCard.OriginalPrice className="text-sm">
                      {formatPlanPrice(plan.originalPriceInCents)}
                    </PricingCard.OriginalPrice>
                  )}
                </PricingCard.Price>

                <Button
                  className="w-full font-semibold"
                  variant={plan.featured ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan)}
                >
                  Assinar plano <ArrowRight data-icon="inline-end" />
                </Button>
              </PricingCard.Header>

              <PricingCard.Body className="pt-0">
                <PricingCard.Description className="min-h-10 text-sm leading-5">
                  {plan.description}
                </PricingCard.Description>
                <PricingCard.List>
                  {plan.features.map((item) => (
                    <PricingCard.ListItem className="text-xs" key={item}>
                      <Check
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                      <span>{item}</span>
                    </PricingCard.ListItem>
                  ))}
                </PricingCard.List>
              </PricingCard.Body>
            </PricingCard.Card>
          );
        })}
      </div>
    </section>
  );
}
