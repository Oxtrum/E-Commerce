import { useMutation, useQueryClient } from "@tanstack/react-query"

import { cartKeys } from "@/hooks/useCart"
import { catalogKeys } from "@/hooks/useCatalog"
import { checkoutService } from "@/services/checkout"
import type { CheckoutRequest } from "@/types/checkout"

interface CheckoutMutationInput {
  cartId: string
  payload: CheckoutRequest
  idempotencyKey: string
}

export function useCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cartId, payload, idempotencyKey }: CheckoutMutationInput) =>
      checkoutService.submit(cartId, payload, idempotencyKey),
    onSuccess: (_, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cartId) })
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
      queryClient.invalidateQueries({ queryKey: ["pedidos"] })
    },
  })
}
