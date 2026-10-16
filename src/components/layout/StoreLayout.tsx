import { ShoppingBag } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

import { CanAny } from "@/components/shared/Can"
import { useAuth } from "@/context/auth-provider"
import { useOrganization } from "@/context/organization-provider"

export function StoreLayout() {
  const { context, isAuthenticated, logout } = useAuth()
  const { organization, clearOrganization } = useOrganization()

  const handleLogout = () => {
    logout()
    clearOrganization()
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            className="group flex items-center gap-2.5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            to="/"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-warm-sm transition-all duration-300 group-hover:rotate-6 group-hover:shadow-glow">
              <ShoppingBag aria-hidden="true" className="size-4" />
            </span>
            <span>
              E-Commerce
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {organization?.nombre}
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/catalogo">Catálogo</Link>
            <Link to="/carrito">Carrito</Link>
            {isAuthenticated ? (
              <>
                <Link to="/mi-cuenta">Mi cuenta</Link>
                <CanAny
                  permissions={[
                    "catalogo:leer",
                    "pedidos:leer",
                    "clientes:leer",
                    "usuarios:leer",
                    "integraciones_inventario:leer",
                  ]}
                >
                  <Link to="/admin">Backoffice</Link>
                </CanAny>
                <button
                  className="underline"
                  onClick={handleLogout}
                  type="button"
                >
                  Salir ({context?.email})
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Ingresar</Link>
                <button
                  className="underline"
                  onClick={clearOrganization}
                  type="button"
                >
                  Cambiar tienda
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
          <div>
            <span className="flex items-center gap-2.5 font-semibold">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBag aria-hidden="true" className="size-3.5" />
              </span>
              E-Commerce
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Catálogo respaldado por inventario verificado.
            </p>
          </div>

          <nav aria-label="Pie de página" className="flex flex-col gap-3 text-sm">
            <span className="font-medium">Más</span>
            <Link
              to="/plataforma"
              className="text-muted-foreground transition-colors duration-200 hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Vende con nosotros
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
