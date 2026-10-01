import AnalyticsApp from '@/features/analytics/app';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const hasAccount = cookieStore.has('access_token');
  const hasPlan = cookieStore.get('subscription_status')?.value === 'active';

  return <AnalyticsApp hasAccount={hasAccount} hasPlan={hasPlan} />;
}
