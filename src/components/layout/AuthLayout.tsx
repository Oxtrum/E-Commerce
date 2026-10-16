import { ShoppingBag } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2 font-semibold" to="/login">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBag aria-hidden="true" className="size-4" />
            </span>
            <span>ECom-Core</span>
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
