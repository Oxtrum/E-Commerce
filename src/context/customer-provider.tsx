import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { UNAUTHORIZED_EVENT } from "@/lib/api"

const CUSTOMER_ID_KEY = "ecom_core_customer_id"

interface CustomerContextValue {
  customerId: string
  selectCustomer: (customerId: string) => void
  clearCustomer: () => void
}

const CustomerContext = createContext<CustomerContextValue | null>(null)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customerId, setCustomerId] = useState(
    () =>
      sessionStorage.getItem(CUSTOMER_ID_KEY) ??
      import.meta.env.VITE_CUSTOMER_ID ??
      "",
  )

  const selectCustomer = useCallback((nextCustomerId: string) => {
    const normalizedId = nextCustomerId.trim()
    if (normalizedId) {
      sessionStorage.setItem(CUSTOMER_ID_KEY, normalizedId)
    } else {
      sessionStorage.removeItem(CUSTOMER_ID_KEY)
    }
    setCustomerId(normalizedId)
  }, [])

  const clearCustomer = useCallback(() => {
    sessionStorage.removeItem(CUSTOMER_ID_KEY)
    setCustomerId("")
  }, [])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearCustomer)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearCustomer)
  }, [clearCustomer])

  return (
    <CustomerContext.Provider
      value={{ customerId, selectCustomer, clearCustomer }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomerSelection() {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error(
      "useCustomerSelection debe usarse dentro de CustomerProvider",
    )
  }
  return context
}
