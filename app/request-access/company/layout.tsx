import { CompanyAccessProvider } from '../../../features/company-access/company-access-state'

export default function CompanyAccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CompanyAccessProvider>
      {children}
    </CompanyAccessProvider>
  )
}