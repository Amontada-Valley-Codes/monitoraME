import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { LeadCtaProvider } from '@/shared/auth/lead-cta-context';
import { SessionProvider } from '@/shared/auth/session-context';

import { Landing } from '@/components/teste/teste-landing';

import './teste/landing.css';

export const metadata: Metadata = {
  title: 'MonitoraME',
  description:
    'Plataforma de inteligência territorial e oportunidades de compras públicas.',
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <Providers>
      <SessionProvider>
        <LeadCtaProvider>
          <Landing />
        </LeadCtaProvider>
      </SessionProvider>
    </Providers>
  );
}
