export interface SavedSearchFilters {
  query?: string;
  municipalities?: string[];
  cnaes?: string[];
  modalities?: string[];
  minValue?: number;
  maxValue?: number;
}

export interface SavedSearchEntity {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
}
