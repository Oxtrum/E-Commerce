import type { Cart } from "@/types/cart"
import type { Order } from "@/types/order"

export interface CheckoutRequest {
  sucursalId?: string
  codigoPedido?: string
  clienteId?: string
  direccionEntrega: string
  codigoCupon?: string
  notas?: string
  minutosExpiracion: number
}

export interface CheckoutResult {
  id?: string
  pedidoId?: string
  codigo?: string
  codigoPedido?: string
  estado?: string
  reservaId?: string
  reservaInventarioId?: string
  pedido?: Order
  carrito?: Cart
}
