import type { Opportunity } from './types'

export const SAVED_OPPORTUNITIES_KEY = 'monitorame:saved-opportunities'
export const SAVED_PIPELINE_KEY = 'monitorame:saved-opportunities-pipeline'

export type OpportunityStage = 'saved' | 'preparing' | 'submitted'
export type OpportunityPipeline = Record<OpportunityStage, Opportunity[]>

export const emptyOpportunityPipeline = (): OpportunityPipeline => ({
  saved: [],
  preparing: [],
  submitted: [],
})

export function readSavedOpportunities(): Opportunity[] {
  try {
    const raw = localStorage.getItem(SAVED_OPPORTUNITIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveOpportunity(opportunity: Opportunity) {
  const saved = readSavedOpportunities()
  if (!saved.some((item) => item.id === opportunity.id)) {
    localStorage.setItem(SAVED_OPPORTUNITIES_KEY, JSON.stringify([opportunity, ...saved]))
  }
}
