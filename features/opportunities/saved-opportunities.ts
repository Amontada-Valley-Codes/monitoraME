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

export function removeSavedOpportunity(id: string) {
  const saved = readSavedOpportunities().filter((item) => item.id !== id)
  localStorage.setItem(SAVED_OPPORTUNITIES_KEY, JSON.stringify(saved))
  try {
    const raw = localStorage.getItem(SAVED_PIPELINE_KEY)
    if (!raw) return
    const pipeline = { ...emptyOpportunityPipeline(), ...JSON.parse(raw) } as OpportunityPipeline
    const next = Object.fromEntries(
      Object.entries(pipeline).map(([stage, items]) => [stage, items.filter((item) => item.id !== id)]),
    ) as OpportunityPipeline
    localStorage.setItem(SAVED_PIPELINE_KEY, JSON.stringify(next))
  } catch { /* malformed demo storage is ignored */ }
}

export function readAllSavedOpportunities(): Opportunity[] {
  const saved = readSavedOpportunities()
  try {
    const raw = localStorage.getItem(SAVED_PIPELINE_KEY)
    const pipeline = raw ? ({ ...emptyOpportunityPipeline(), ...JSON.parse(raw) } as OpportunityPipeline) : emptyOpportunityPipeline()
    const all = [...saved, ...Object.values(pipeline).flat()]
    return all.filter((item, index) => all.findIndex((candidate) => candidate.id === item.id) === index)
  } catch {
    return saved
  }
}
