'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { CompanyReviewFormData } from './types'

interface CompanyAccessState {
  formData: Partial<CompanyReviewFormData>
  updateFormData: (data: Partial<CompanyReviewFormData>) => void
}

const CompanyAccessContext = createContext<CompanyAccessState | undefined>(undefined)

export function CompanyAccessProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<Partial<CompanyReviewFormData>>({})

  const updateFormData = (data: Partial<CompanyReviewFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <CompanyAccessContext.Provider value={{ formData, updateFormData }}>
      {children}
    </CompanyAccessContext.Provider>
  )
}

export function useCompanyAccess() {
  const context = useContext(CompanyAccessContext)
  if (!context) throw new Error('useCompanyAccess must be used within CompanyAccessProvider')
  return context
}