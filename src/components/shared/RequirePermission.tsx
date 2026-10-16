import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "@/context/auth-provider"

interface RequirePermissionProps {
  permission: string
  children: ReactNode
}

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { hasPermission } = useAuth()
  return hasPermission(permission) ? children : <Navigate replace to="/403" />
}

export function RequireAnyPermission({
  permissions,
  children,
}: {
  permissions: string[]
  children: ReactNode
}) {
  const { hasPermission } = useAuth()
  return permissions.some(hasPermission) ? (
    children
  ) : (
    <Navigate replace to="/403" />
  )
}
