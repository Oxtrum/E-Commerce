import { Link } from "react-router-dom"

import { RequestError } from "@/components/shared/RequestError"
import { useAdminPage } from "@/hooks/useAdmin"
import { adminService } from "@/services/admin"
import type { AdminProduct } from "@/types/admin"

export default function AdminCatalogPage() {
  const products = useAdminPage<AdminProduct>(
    "productos",
    adminService.listProducts,
    100,
  )

  return (
    <section>
      <h2 className="text-xl font-semibold">Publicaciones de catálogo</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Estas publicaciones alimentan el catálogo visible para clientes.
      </p>

      {products.isPending ? <p className="mt-4">Cargando...</p> : null}
      {products.error ? (
        <div className="mt-4">
          <RequestError error={products.error} />
        </div>
      ) : null}

      {products.data?.items.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2">Código</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Categoría</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.data.items.map((product) => (
                <tr className="border-b" key={product.id}>
                  <td className="p-2">{product.codigo}</td>
                  <td className="p-2">{product.nombre}</td>
                  <td className="p-2">
                    {product.categoriaNombre ?? "Sin categoría"}
                  </td>
                  <td className="p-2">
                    {product.precio} {product.moneda}
                  </td>
                  <td className="p-2">
                    {product.activo === false || product.publicado === false
                      ? "No publicada"
                      : "Publicada"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : products.data ? (
        <div className="mt-4 rounded-md border p-4 text-sm">
          <p>No existen publicaciones locales; por eso el catálogo está vacío.</p>
          <Link className="mt-2 inline-block underline" to="/admin/inventario">
            Ir a sincronización con Inventario SaaS
          </Link>
        </div>
      ) : null}
    </section>
  )
}
