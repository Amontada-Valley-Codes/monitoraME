import { OpportunityCard } from './components/opportunity-card';
import { OpportunityFeedHeader } from './components/opportunity-feed-header';
import { OpportunitySearch } from './components/opportunity-search';
import { OpportunitySidebar } from './components/opportunity-sidebar';
import { OpportunityRightPanel } from './components/opportunity-right-panel';
import { opportunitiesMock } from './mocks';

export default function OpportunitiesApp() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <OpportunitySidebar />

        <main className="min-w-0 flex-1 border-r bg-card">
          <OpportunityFeedHeader />

          <OpportunitySearch />

          <div className="divide-y divide-slate-200">
            {opportunitiesMock.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
              />
            ))}
          </div>
        </main>

        <OpportunityRightPanel />
      </div>
    </div>
  );
}
