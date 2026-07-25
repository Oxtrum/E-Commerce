export interface CatalogoVariante {
  id: string
  productoVarianteId: string
  sku: string
  codigoBarras: string | null
  nombre: string
  precio: number
  stockVisible: number
  atributos: Record<string, unknown>
}

export interface CatalogoProducto {
  id: string
  categoriaId: string | null
  categoriaNombre: string | null
  categoriaSlug: string | null
  productoInventarioId: string | null
  codigo: string
  nombre: string
  slug: string
  descripcionCorta: string | null
  descripcionLarga: string | null
  precio: number
  moneda: string
  stockVisible: number | null
  modoOrigen: string
  imagenPrincipal: string | null
  variantes: CatalogoVariante[]
}

export interface PaginacionCatalogo {
  limit: number
  offset: number
  total: number
  hasMore: boolean
}

export interface PaginaCatalogo {
  items: CatalogoProducto[]
  pagination: PaginacionCatalogo
}

export interface CatalogoFiltros {
  categoriaSlug?: string
  nombre?: string
  limit?: number
  offset?: number
}
