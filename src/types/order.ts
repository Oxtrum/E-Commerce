import type { PaginationParams } from "@/types/common"

export interface OrderFilters extends PaginationParams {
  clienteId?: string
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface OrderItem {
  id?: string
  productoInventarioId?: string | null
  productoVarianteId?: string | null
  sku?: string | null
  codigo?: string | null
  nombre?: string | null
  varianteNombre?: string | null
  atributos?: Record<string, unknown>
  cantidad: number
  precioUnitario: number
  descuento?: number
  impuesto?: number
  subtotal: number
  total: number
}

export interface Order {
  id: string
  codigo?: string
  codigoPedido?: string
  clienteId?: string | null
  estado: string
  sucursalId?: string | null
  reservaInventarioId?: string | null
  direccionEntrega?: string | null
  subtotal: number
  descuentoTotal: number
  impuestoTotal: number
  total: number
  moneda: string
  notas?: string | null
  items?: OrderItem[]
  detalles?: OrderItem[]
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface Payment {
  id: string
  pedidoId: string
  codigo?: string
  estado: string
  metodo?: string | null
  monto: number
  moneda: string
  referencia?: string | null
  observacion?: string | null
  metadata?: Record<string, unknown>
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface Invoice {
  id: string
  pedidoId?: string | null
  clienteId?: string | null
  codigo?: string
  numeroFactura?: string | null
  estado: string
  fiscalNombre?: string | null
  fiscalTipoDocumento?: string | null
  fiscalDocumento?: string | null
  subtotal: number
  descuentoTotal: number
  impuestoTotal: number
  total: number
  moneda: string
  items?: OrderItem[]
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface Shipment {
  id: string
  pedidoId: string
  codigo?: string
  estado: string
  metodoEnvio?: string | null
  transportista?: string | null
  trackingCodigo?: string | null
  direccionDestino?: string | null
  fechaDespacho?: string | null
  fechaEntrega?: string | null
  notas?: string | null
  fechaCreacion?: string
  fechaActualizacion?: string
}
