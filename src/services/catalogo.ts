import { api, type RequestOptions } from "@/lib/api"
import type {
  CatalogoFiltros,
  CatalogoProducto,
  PaginaCatalogo,
} from "@/types/catalogo"

const ORGANIZACION_SLUG: string =
  import.meta.env.VITE_ORGANIZACION_SLUG ?? ""

function conOrganizacion(filtros: CatalogoFiltros = {}) {
  return {
    organizacionSlug: ORGANIZACION_SLUG || undefined,
    categoriaSlug: filtros.categoriaSlug,
    nombre: filtros.nombre,
    limit: filtros.limit,
    offset: filtros.offset,
  }
}

export const catalogoService = {
  listar: (filtros: CatalogoFiltros = {}, options?: RequestOptions) =>
    api.get<PaginaCatalogo>("/catalogo/productos", {
      ...options,
      params: conOrganizacion(filtros),
    }),

  obtenerPorSlug: (slug: string, options?: RequestOptions) =>
    api.get<CatalogoProducto>(`/catalogo/productos/${slug}`, {
      ...options,
      params: { organizacionSlug: ORGANIZACION_SLUG || undefined },
    }),
}
