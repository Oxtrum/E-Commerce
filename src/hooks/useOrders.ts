import { useQuery } from "@tanstack/react-query"

import {
  ordersService,
  type InvoiceFilters,
} from "@/services/orders"
import type { OrderFilters } from "@/types/order"

export const orderKeys = {
  all: ["pedidos"] as const,
  list: (filters: OrderFilters) => [...orderKeys.all, "lista", filters] as const,
  detail: (orderId: string) => [...orderKeys.all, "detalle", orderId] as const,
  payments: (orderId: string) =>
    [...orderKeys.detail(orderId), "pagos"] as const,
  shipments: (orderId: string) =>
    [...orderKeys.detail(orderId), "envios"] as const,
}

export const invoiceKeys = {
  all: ["facturas"] as const,
  list: (filters: InvoiceFilters) =>
    [...invoiceKeys.all, "lista", filters] as const,
  detail: (invoiceId: string) =>
    [...invoiceKeys.all, "detalle", invoiceId] as const,
}

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: ({ signal }) => ordersService.list(filters, signal),
    enabled: Boolean(filters.clienteId),
  })
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => ordersService.get(orderId, signal),
    enabled: Boolean(orderId),
  })
}

export function useOrderPayments(orderId: string) {
  return useQuery({
    queryKey: orderKeys.payments(orderId),
    queryFn: ({ signal }) => ordersService.listPayments(orderId, signal),
    enabled: Boolean(orderId),
  })
}

export function useOrderShipments(orderId: string) {
  return useQuery({
    queryKey: orderKeys.shipments(orderId),
    queryFn: ({ signal }) => ordersService.listShipments(orderId, signal),
    enabled: Boolean(orderId),
  })
}

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: ({ signal }) => ordersService.listInvoices(filters, signal),
    enabled: Boolean(filters.clienteId || filters.pedidoId),
  })
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceId),
    queryFn: ({ signal }) => ordersService.getInvoice(invoiceId, signal),
    enabled: Boolean(invoiceId),
  })
}
