import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useOrganization } from "@/context/organization-provider"

export function OrganizationRoute() {
  const { organization } = useOrganization()
  const location = useLocation()

  if (!organization) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/seleccionar-tienda"
      />
    )
  }

  return <Outlet />
}
