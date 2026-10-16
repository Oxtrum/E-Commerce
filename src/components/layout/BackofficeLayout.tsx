import { Link, Outlet } from "react-router-dom"

import { Can } from "@/components/shared/Can"

export function BackofficeLayout() {
  return (
    <section className="mx-auto max-w-7xl p-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold">Backoffice</h1>
        <nav className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link className="underline" to="/admin">Resumen</Link>
          <Can permission="catalogo:leer"><Link className="underline" to="/admin/catalogo">Catálogo</Link></Can>
          <Can permission="clientes:leer"><Link className="underline" to="/admin/clientes">Clientes</Link></Can>
          <Can permission="pedidos:leer"><Link className="underline" to="/admin/comercial">Operación comercial</Link></Can>
          <Can permission="organizaciones:leer"><Link className="underline" to="/admin/acceso">Acceso y configuración</Link></Can>
          <Can permission="integraciones_inventario:leer"><Link className="underline" to="/admin/inventario">Inventario SaaS</Link></Can>
        </nav>
      </div>
      <div className="py-6">
        <Outlet />
      </div>
    </section>
  )
}
