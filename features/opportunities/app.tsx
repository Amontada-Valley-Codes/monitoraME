import { OpportunityCard } from './components/opportunity-card';
import { OpportunityFeedHeader } from './components/opportunity-feed-header';
import { OpportunitySearch } from './components/opportunity-search';
import { OpportunitySidebar } from './components/opportunity-sidebar';
import { OpportunityRightPanel } from './components/opportunity-right-panel';
import { opportunitiesMock } from './mocks';

export default function OpportunitiesApp() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1340px]">
        <OpportunitySidebar />

        <main className="w-full min-w-0 max-w-[680px] border-r border-slate-200 bg-white">
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