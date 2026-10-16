import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/context/auth-provider"

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p className="p-6">Restaurando sesión...</p>
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
