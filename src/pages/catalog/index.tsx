import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"

import { RequestError } from "@/components/shared/RequestError"
import { useOrganization } from "@/context/organization-provider"
import { useCatalog, useCatalogCategories } from "@/hooks/useCatalog"
import { formatCurrency } from "@/lib/utils"
import type { CatalogFilters } from "@/types/catalog"

const pageSize = 24

export default function CatalogPage() {
  const { organization } = useOrganization()
  const [nameDraft, setNameDraft] = useState("")
  const [categoryDraft, setCategoryDraft] = useState("")
  const [filters, setFilters] = useState<CatalogFilters>({
    limit: pageSize,
    offset: 0,
  })
  const organizationFilter = organization?.slug
    ? { organizacionSlug: organization.slug }
    : { organizacionCodigo: organization?.codigo }
  const catalog = useCatalog({ ...filters, ...organizationFilter })
  const categories = useCatalogCategories(organizationFilter)

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFilters({
      nombre: nameDraft.trim() || undefined,
      categoriaSlug: categoryDraft.trim() || undefined,
      limit: pageSize,
      offset: 0,
    })
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Catálogo</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tienda: {organization?.nombre}
      </p>

      <form className="mt-5 grid gap-3 md:grid-cols-3" onSubmit={applyFilters}>
        <label className="text-sm">
          Nombre
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            onChange={(event) => setNameDraft(event.target.value)}
            value={nameDraft}
          />
        </label>
        <label className="text-sm">
          Categoría
          <select
            className="mt-1 w-full rounded-md border bg-background p-2"
            onChange={(event) => setCategoryDraft(event.target.value)}
            value={categoryDraft}
          >
            <option value="">Todas</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          className="self-end rounded-md bg-primary px-4 py-2 text-primary-foreground"
          type="submit"
        >
          Buscar
        </button>
      </form>

      {catalog.isPending ? <p className="mt-6">Cargando catálogo...</p> : null}
      {catalog.error ? (
        <div className="mt-6">
          <RequestError error={catalog.error} />
        </div>
      ) : null}

      {catalog.data ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {catalog.data.pagination.total} productos encontrados
          </p>
          {catalog.data.items.length ? (
            <ul className="mt-3 divide-y rounded-md border">
              {catalog.data.items.map((product) => (
                <li className="p-4" key={product.id}>
                  <Link
                    className="font-medium underline"
                    to={`/producto/${product.slug}`}
                  >
                    {product.nombre}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.codigo} · {formatCurrency(product.precio, product.moneda)} ·
                    stock visible {product.stockVisible ?? "no informado"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3">
              No hay productos publicados para esta tienda o estos filtros.
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              disabled={(filters.offset ?? 0) === 0}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  offset: Math.max(0, (current.offset ?? 0) - pageSize),
                }))
              }
              type="button"
            >
              Anterior
            </button>
            <button
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              disabled={!catalog.data.pagination.hasMore}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  offset: (current.offset ?? 0) + pageSize,
                }))
              }
              type="button"
            >
              Siguiente
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
