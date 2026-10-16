import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { UNAUTHORIZED_EVENT } from "@/lib/api"
import { queryClient } from "@/lib/query-client"
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/session"
import { authService } from "@/services/auth"
import type { AuthContextData, LoginRequest } from "@/types/auth"

interface AuthContextValue {
  context: AuthContextData | null
  permisos: string[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AuthContextData | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(getAccessToken()))

  const clearSession = useCallback(() => {
    queryClient.clear()
    clearAccessToken()
    setContext(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession)
  }, [clearSession])

  useEffect(() => {
    if (!getAccessToken()) return

    authService
      .me()
      .then(setContext)
      .catch(clearSession)
      .finally(() => setIsLoading(false))
  }, [clearSession])

  const login = useCallback(async (payload: LoginRequest) => {
    clearAccessToken()
    const response = await authService.login(payload)
    setAccessToken(response.token)

    try {
      const currentContext = await authService.me()
      setContext(currentContext)
    } catch (error) {
      clearAccessToken()
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }, [clearSession])

  const hasPermission = useCallback(
    (permission: string) => context?.permisos.includes(permission) ?? false,
    [context],
  )

  return (
    <AuthContext.Provider
      value={{
        context,
        permisos: context?.permisos ?? [],
        isAuthenticated: Boolean(context),
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return context
}
