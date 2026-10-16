import type { PaginationParams } from "@/types/common"

export interface CatalogFilters extends PaginationParams {
  organizacionSlug?: string
  organizacionCodigo?: string
  categoriaSlug?: string
  nombre?: string
}

export interface CatalogVariant {
  id: string
  productoVarianteId: string
  sku: string
  codigoBarras?: string | null
  nombre: string
  precio: number
  stockVisible: number
  atributos: Record<string, unknown>
}

export interface CatalogProduct {
  id: string
  categoriaId?: string | null
  categoriaNombre?: string | null
  categoriaSlug?: string | null
  productoInventarioId?: string | null
  codigo: string
  nombre: string
  slug: string
  descripcionCorta?: string | null
  descripcionLarga?: string | null
  precio: number
  moneda: string
  stockVisible?: number | null
  modoOrigen: string
  imagenPrincipal?: string | null
	variantes?: CatalogVariant[]
}

export interface CatalogCategory {
  nombre: string
  slug: string
}
