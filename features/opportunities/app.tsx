import { OpportunityCard } from './components/opportunity-card';
import { OpportunityFeedHeader } from './components/opportunity-feed-header';
import { OpportunitySearch } from './components/opportunity-search';
import { opportunitiesMock } from './mocks';

export default function OpportunitiesApp() {
  return (
    <div className="mx-auto w-full max-w-3xl bg-white">
      <OpportunityFeedHeader />

      <OpportunitySearch />

      <div>
        {opportunitiesMock.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
          />
        ))}
      </div>
    </div>
  );
}