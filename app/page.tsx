import { LandingPage } from '@/features/landing/landing-page';
import { LeadCtaProvider } from '@/shared/auth/lead-cta-context';
import { SessionProvider } from '@/shared/auth/session-context';
import { Providers } from './providers';

export default function Home() {
  return <Providers><SessionProvider><LeadCtaProvider><LandingPage /></LeadCtaProvider></SessionProvider></Providers>;
}
