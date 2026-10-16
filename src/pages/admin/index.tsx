import { Link } from "react-router-dom"

import { Can } from "@/components/shared/Can"
import { useAuth } from "@/context/auth-provider"

export default function AdminHomePage() {
  const { context, permisos } = useAuth()

  return (
    <section>
      <h2 className="text-xl font-semibold">Resumen administrativo</h2>
      <p className="mt-2 text-muted-foreground">
        Sesión de {context?.email} con rol {context?.rolCodigo}.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Can permission="catalogo:leer"><Link className="rounded-md border p-4" to="/admin/catalogo">Publicaciones de catálogo</Link></Can>
        <Can permission="clientes:leer"><Link className="rounded-md border p-4" to="/admin/clientes">Clientes y direcciones</Link></Can>
        <Can permission="pedidos:leer"><Link className="rounded-md border p-4" to="/admin/comercial">Operación comercial</Link></Can>
        <Can permission="organizaciones:leer"><Link className="rounded-md border p-4" to="/admin/acceso">Acceso y configuración</Link></Can>
        <Can permission="integraciones_inventario:leer"><Link className="rounded-md border p-4" to="/admin/inventario">Integración de inventario</Link></Can>
      </div>
      <h2 className="mt-6 font-semibold">Permisos informados por la API</h2>
      {permisos.length ? (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {permisos.map((permission) => (
            <li key={permission}>{permission}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          La sesión no informó permisos.
        </p>
      )}
    </section>
  )
}
