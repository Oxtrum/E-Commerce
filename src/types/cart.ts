export interface CartItem {
  id: string
  carritoId: string
  organizacionId: string
  linea: number
  productoInventarioId?: string | null
  productoVarianteId: string
  sku: string
  codigoBarras?: string | null
  productoCodigo?: string | null
  productoNombre: string
  varianteNombre: string
  descripcion?: string | null
  atributos: Record<string, unknown>
  cantidad: number
  precioUnitario: number
  descuentoTotal: number
  impuestoTotal: number
  subtotal: number
  total: number
  metadata: Record<string, unknown>
  fechaCreacion: string
  fechaActualizacion: string
}

export interface Cart {
  id: string
  organizacionId: string
  propietarioUsuarioId: string
  codigo: string
  clienteReferencia?: string | null
  clienteEmail?: string | null
  estado: string
  moneda: string
  subtotal: number
  descuentoTotal: number
  impuestoTotal: number
  total: number
  metadata: Record<string, unknown>
  items: CartItem[]
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface AddCartItemRequest {
  productoVarianteId: string
  cantidad: number
}

export interface UpdateCartItemRequest {
  cantidad: number
}
