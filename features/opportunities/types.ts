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
};