import { ShoppingBag, Truck } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

export function StoreLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            className="group flex items-center gap-2.5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            to="/"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-warm-sm transition-all duration-300 group-hover:rotate-6 group-hover:shadow-glow">
              <ShoppingBag aria-hidden="true" className="size-4" />
            </span>
            <span className="tracking-tight">E-Commerce</span>
          </Link>

          <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-warm-sm sm:inline-flex">
            <Truck aria-hidden="true" className="size-3.5 text-accent-strong" />
            Envíos con seguimiento
          </span>
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
