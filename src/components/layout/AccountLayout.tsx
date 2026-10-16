import { Link, Outlet } from "react-router-dom"

import { useCustomerSelection } from "@/context/customer-provider"

export function AccountLayout() {
  const { customerId } = useCustomerSelection()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold">Mi cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cliente seleccionado: {customerId || "ninguno"}
        </p>
        <nav className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link className="underline" to="/mi-cuenta">
            Perfil
          </Link>
          <Link className="underline" to="/mi-cuenta/direcciones">
            Direcciones
          </Link>
          <Link className="underline" to="/mi-cuenta/pedidos">
            Pedidos
          </Link>
          <Link className="underline" to="/mi-cuenta/facturas">
            Facturas
          </Link>
        </nav>
      </div>
      <div className="py-6">
        <Outlet />
      </div>
    </div>
  )
}
