import { Navigate, useLocation, useNavigate } from "react-router-dom"

import { useOrganization } from "@/context/organization-provider"
import { useAvailableOrganizations } from "@/hooks/useOrganizations"
import type { Organization } from "@/types/organization"

interface SelectionLocationState {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

function getReturnPath(state: SelectionLocationState | null) {
  const from = state?.from
  if (!from?.pathname || from.pathname === "/seleccionar-tienda") return "/"
  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
}

export default function OrganizationSelectionPage() {
  const { organization, selectOrganization } = useOrganization()
  const organizations = useAvailableOrganizations(!organization)
  const location = useLocation()
  const navigate = useNavigate()
  const returnPath = getReturnPath(
    location.state as SelectionLocationState | null,
  )

  if (organization) return <Navigate replace to={returnPath} />

  const chooseOrganization = (selected: Organization) => {
    selectOrganization(selected)
    navigate(returnPath, { replace: true })
  }

  const available = organizations.data ?? []

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Selecciona tu tienda</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Podrás recorrer su catálogo sin iniciar sesión.
      </p>

      {organizations.isPending ? (
        <p className="mt-6 text-sm">Buscando tiendas disponibles...</p>
      ) : null}

      {available.length ? (
        <div className="mt-6 space-y-3">
          {available.map((item) => (
            <button
              className="w-full rounded-md border p-3 text-left hover:bg-muted"
              key={item.id ?? item.codigo}
              onClick={() => chooseOrganization(item)}
              type="button"
            >
              <span className="block font-medium">{item.nombre}</span>
            </button>
          ))}
        </div>
      ) : null}

      {organizations.error ? (
        <div className="mt-6 rounded-md border border-destructive p-3 text-sm">
          <p className="text-destructive">
            No fue posible cargar las tiendas disponibles.
          </p>
          <button
            className="mt-3 underline disabled:opacity-50"
            disabled={organizations.isFetching}
            onClick={() => organizations.refetch()}
            type="button"
          >
            {organizations.isFetching ? "Reintentando..." : "Reintentar"}
          </button>
        </div>
      ) : null}

      {!organizations.isPending &&
      !organizations.error &&
      !available.length ? (
        <p className="mt-6 rounded-md border p-3 text-sm">
          No hay tiendas activas disponibles para ingresar.
        </p>
      ) : null}
    </section>
  )
}
