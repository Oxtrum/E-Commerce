import type { ReactNode } from "react"

import { useAuth } from "@/context/auth-provider"

interface CanProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useAuth()
  return hasPermission(permission) ? children : fallback
}

interface CanAnyProps {
  permissions: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
  const { hasPermission } = useAuth()
  return permissions.some(hasPermission) ? children : fallback
}
