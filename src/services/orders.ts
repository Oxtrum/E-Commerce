import { api } from "@/lib/api"
import type { PaginationParams } from "@/types/common"
import type {
  Invoice,
  Order,
  OrderFilters,
  Payment,
  Shipment,
} from "@/types/order"

export interface InvoiceFilters extends PaginationParams {
  clienteId?: string
  pedidoId?: string
  estado?: string
}

export const ordersService = {
  list: (filters: OrderFilters, signal?: AbortSignal) =>
    api.getPage<Order>("/pedidos", { params: { ...filters }, signal }),
  get: (orderId: string, signal?: AbortSignal) =>
    api.get<Order>(`/pedidos/${orderId}`, { signal }),
  listPayments: (orderId: string, signal?: AbortSignal) =>
    api.getPage<Payment>("/pagos", {
      params: { pedidoId: orderId, limit: 50, offset: 0 },
      signal,
    }),
  listInvoices: (filters: InvoiceFilters, signal?: AbortSignal) =>
    api.getPage<Invoice>("/facturas", {
      params: { ...filters },
      signal,
    }),
  getInvoice: (invoiceId: string, signal?: AbortSignal) =>
    api.get<Invoice>(`/facturas/${invoiceId}`, { signal }),
  listShipments: (orderId: string, signal?: AbortSignal) =>
    api.getPage<Shipment>("/envios", {
      params: { pedidoId: orderId, limit: 50, offset: 0 },
      signal,
    }),
}
