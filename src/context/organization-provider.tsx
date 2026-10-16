import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"

import { queryClient } from "@/lib/query-client"
import type { Organization } from "@/types/organization"

const ORGANIZATION_KEY = "ecom_core_organization"

interface OrganizationContextValue {
  organization: Organization | null
  selectOrganization: (organization: Organization) => void
  clearOrganization: () => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

function readStoredOrganization() {
  const stored = sessionStorage.getItem(ORGANIZATION_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as Organization
  } catch {
    sessionStorage.removeItem(ORGANIZATION_KEY)
    return null
  }
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(
    readStoredOrganization,
  )

  const clearOrganization = useCallback(() => {
    queryClient.clear()
    sessionStorage.removeItem(ORGANIZATION_KEY)
    setOrganization(null)
  }, [])

  const selectOrganization = useCallback((selected: Organization) => {
    queryClient.clear()
    sessionStorage.setItem(ORGANIZATION_KEY, JSON.stringify(selected))
    setOrganization(selected)
  }, [])

  return (
    <OrganizationContext.Provider
      value={{ organization, selectOrganization, clearOrganization }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error(
      "useOrganization debe usarse dentro de OrganizationProvider",
    )
  }
  return context
}
