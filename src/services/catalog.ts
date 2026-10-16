import { api } from "@/lib/api"
import type {
  CatalogCategory,
  CatalogFilters,
  CatalogProduct,
} from "@/types/catalog"

export const catalogService = {
  list: (filters: CatalogFilters, signal?: AbortSignal) =>
    api.getPage<CatalogProduct>("/catalogo/productos", {
      params: { ...filters },
      signal,
    }),
  getBySlug: (
    slug: string,
    organization: Pick<
      CatalogFilters,
      "organizacionSlug" | "organizacionCodigo"
    >,
    signal?: AbortSignal,
  ) =>
    api.get<CatalogProduct>(`/catalogo/productos/${slug}`, {
      params: { ...organization },
      signal,
    }),
  async listCategories(
    organization: Pick<
      CatalogFilters,
      "organizacionSlug" | "organizacionCodigo"
    >,
    signal?: AbortSignal,
  ): Promise<CatalogCategory[]> {
    const categories = new Map<string, CatalogCategory>()
    const limit = 200
    let offset = 0

    while (true) {
      const page = await api.getPage<CatalogProduct>("/catalogo/productos", {
        params: { ...organization, limit, offset },
        signal,
      })

      page.items.forEach((product) => {
        if (product.categoriaSlug && product.categoriaNombre) {
          categories.set(product.categoriaSlug, {
            slug: product.categoriaSlug,
            nombre: product.categoriaNombre,
          })
        }
      })

      if (!page.pagination.hasMore) break
      if (page.items.length === 0) {
        throw new Error("El catálogo devolvió una página vacía con más resultados")
      }
      offset += page.items.length
    }

    return [...categories.values()].sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    )
  },
}
