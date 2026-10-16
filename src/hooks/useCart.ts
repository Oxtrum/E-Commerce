import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { cartService } from "@/services/cart"
import type { AddCartItemRequest } from "@/types/cart"

export const cartKeys = {
  all: ["carritos"] as const,
  lists: () => [...cartKeys.all, "lista"] as const,
  detail: (cartId: string) => [...cartKeys.all, "detalle", cartId] as const,
}

export function useCarts() {
  return useQuery({
    queryKey: cartKeys.lists(),
    queryFn: ({ signal }) => cartService.list(signal),
  })
}

export function useCart(cartId: string) {
  return useQuery({
    queryKey: cartKeys.detail(cartId),
    queryFn: ({ signal }) => cartService.getWithItems(cartId, signal),
    enabled: Boolean(cartId),
  })
}

export function useCreateCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartService.create,
    onSuccess: (cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.setQueryData(cartKeys.detail(cart.id), cart)
    },
  })
}

export function useAddCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddCartItemRequest) => {
      const cart = await cartService.getOrCreateEditableCart()
      const updatedCart = await cartService.addItem(cart.id, payload)
      return { cartId: cart.id, cart: updatedCart }
    },
    onSuccess: ({ cartId, cart }) => {
      queryClient.setQueryData(cartKeys.detail(cartId), cart)
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
    },
  })
}

export function useUpdateCartItem(cartId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, cantidad }: { itemId: string; cantidad: number }) =>
      cartService.updateItem(cartId, itemId, { cantidad }),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.detail(cartId), cart)
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
    },
  })
}

export function useRemoveCartItem(cartId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(cartId, itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.detail(cartId), cart)
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
    },
  })
}
