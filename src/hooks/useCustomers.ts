import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { customerService } from "@/services/customers"
import type { CreateCustomerAddressRequest } from "@/types/customer"

export const customerKeys = {
  all: ["clientes"] as const,
  detail: (customerId: string) =>
    [...customerKeys.all, "detalle", customerId] as const,
  addresses: (customerId: string) =>
    [...customerKeys.detail(customerId), "direcciones"] as const,
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: ({ signal }) => customerService.get(customerId, signal),
    enabled: Boolean(customerId),
  })
}

export function useCustomerAddresses(customerId: string) {
  return useQuery({
    queryKey: customerKeys.addresses(customerId),
    queryFn: ({ signal }) =>
      customerService.listAddresses(customerId, signal),
    enabled: Boolean(customerId),
  })
}

export function useCreateCustomerAddress(customerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCustomerAddressRequest) =>
      customerService.createAddress(customerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.addresses(customerId),
      })
    },
  })
}
