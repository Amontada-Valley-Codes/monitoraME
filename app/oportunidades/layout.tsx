import type { ReactNode } from 'react';
import { OpportunityDemoProvider } from '@/features/opportunities/notification-context';

export default function OpportunitiesLayout({ children }: { children: ReactNode }) {
  return <OpportunityDemoProvider>{children}</OpportunityDemoProvider>;
}
