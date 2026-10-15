export type Opportunity = {
  id: string;
  organization: string;
  title: string;
  description: string;
  modality: string;
  estimatedValue: number;
  openingDate: string;
  city: string;
  state: string;
  source: string;
  officialUrl?: string;
  closingDate: string;
  matchScore: number;
  confidence: number;
  matchReasons: string[];
  relatedCnaes: string[];
  status: 'open' | 'suspended' | 'closed' | 'cancelled';
};
