import { ShoppingBag } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

export function StoreLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2 font-semibold" to="/">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBag aria-hidden="true" className="size-4" />
            </span>
            <span>E-Commerce</span>
          </Link>
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Base inicial
          </span>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

