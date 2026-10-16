import { api } from "@/lib/api"
import type { CheckoutRequest, CheckoutResult } from "@/types/checkout"

export const checkoutService = {
  submit: (
    cartId: string,
    payload: CheckoutRequest,
    idempotencyKey: string,
  ) =>
    api.post<CheckoutResult>(`/carritos/${cartId}/checkout`, payload, {
      idempotencyKey,
    }),
}
