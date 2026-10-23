'use client';

import { ArrowRight, BadgeCheck, Mail, Phone, UserRound } from 'lucide-react';
import { useLeadCta } from '@/shared/auth/lead-cta-context';
import { Button } from '@/components/ui/button';

export function LandingLeadCta() {
  const { openLeadCta } = useLeadCta();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-white">Receba seu acesso gratuito</h3>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Informe seus dados para receber um link seguro e acompanhar oportunidades relevantes.
        </p>
      </div>
      <ul className="space-y-3 text-sm text-white/85">
        <li className="flex items-center gap-2"><UserRound className="size-4 text-[var(--landing-orange)]" /> Nome completo</li>
        <li className="flex items-center gap-2"><Mail className="size-4 text-[var(--landing-orange)]" /> E-mail profissional</li>
        <li className="flex items-center gap-2"><Phone className="size-4 text-[var(--landing-orange)]" /> Telefone com DDD</li>
      </ul>
      <Button type="button" onClick={openLeadCta} className="h-12 w-full rounded-full bg-[var(--landing-orange)] font-semibold text-white hover:bg-[var(--landing-orange)]/90">
        Solicitar acesso gratuito <ArrowRight className="size-4" />
      </Button>
      <p className="flex items-start gap-2 text-xs leading-5 text-white/65">
        <BadgeCheck className="mt-0.5 size-4 shrink-0" /> Seus dados são usados para viabilizar seu acesso e a comunicação sobre a plataforma.
      </p>
    </div>
  );
}
