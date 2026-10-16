import { api } from "@/lib/api"
import {
  normalizeCollection,
  type CollectionResponse,
} from "@/lib/pagination"
import type {
  CreateCustomerAddressRequest,
  Customer,
  CustomerAddress,
} from "@/types/customer"

export function serializeAddress(address: CustomerAddress) {
  return [
    address.destinatario,
    address.direccionLinea1,
    address.direccionLinea2,
    address.ciudad,
    address.departamento,
    address.pais,
    address.codigoPostal,
    address.referencia ? `Referencia: ${address.referencia}` : null,
    address.telefono ? `Teléfono: ${address.telefono}` : null,
  ]
    .filter(Boolean)
    .join(", ")
}

export const customerService = {
  get: (customerId: string, signal?: AbortSignal) =>
    api.get<Customer>(`/clientes/${customerId}`, { signal }),
  listAddresses: async (customerId: string, signal?: AbortSignal) => {
    const response = await api.get<CollectionResponse<CustomerAddress>>(
      `/clientes/${customerId}/direcciones`,
      { signal },
    )
    return normalizeCollection(response)
  },
  createAddress: (
    customerId: string,
    payload: CreateCustomerAddressRequest,
  ) =>
    api.post<CustomerAddress>(
      `/clientes/${customerId}/direcciones`,
      payload,
    ),
}
