import { api } from "@/lib/api"
import {
  normalizeCollection,
  type CollectionResponse,
} from "@/lib/pagination"
import type {
  AddCartItemRequest,
  Cart,
  CartItem,
  UpdateCartItemRequest,
} from "@/types/cart"

const EDITABLE_CART_STATES = new Set(["borrador", "activo"])
const VISIBLE_CART_STATES = new Set([
  "borrador",
  "activo",
  "pendiente_checkout",
  "reservado",
])

export function isEditableCart(cart: Cart) {
  return EDITABLE_CART_STATES.has(cart.estado)
}

export function selectCurrentCart(carts: Cart[]) {
  return (
    carts.find((cart) => EDITABLE_CART_STATES.has(cart.estado)) ??
    carts.find((cart) => VISIBLE_CART_STATES.has(cart.estado)) ??
    null
  )
}

let activeCartPromise: Promise<Cart> | null = null

async function list(signal?: AbortSignal) {
  const response = await api.get<CollectionResponse<Cart>>("/carritos", {
    signal,
  })
  return normalizeCollection(response)
}

async function getOrCreateEditableCart() {
  if (activeCartPromise) return activeCartPromise

  activeCartPromise = list()
    .then(async (carts) => {
      const existing = carts.find(isEditableCart)
      return existing ?? api.post<Cart>("/carritos", {})
    })
    .finally(() => {
      activeCartPromise = null
    })

  return activeCartPromise
}

export const cartService = {
  list,
  create: () => api.post<Cart>("/carritos", {}),
  get: (cartId: string, signal?: AbortSignal) =>
    api.get<Cart>(`/carritos/${cartId}`, { signal }),
  listItems: async (cartId: string, signal?: AbortSignal) => {
    const response = await api.get<CollectionResponse<CartItem>>(
      `/carritos/${cartId}/items`,
      { signal },
    )
    return normalizeCollection(response)
  },
  getWithItems: (cartId: string, signal?: AbortSignal) =>
    api.get<Cart>(`/carritos/${cartId}`, { signal }),
  getOrCreateEditableCart,
  addItem: (cartId: string, payload: AddCartItemRequest) =>
    api.post<Cart>(`/carritos/${cartId}/items`, payload),
  updateItem: (
    cartId: string,
    itemId: string,
    payload: UpdateCartItemRequest,
  ) => api.patch<Cart>(`/carritos/${cartId}/items/${itemId}`, payload),
  removeItem: (cartId: string, itemId: string) =>
    api.del<Cart>(`/carritos/${cartId}/items/${itemId}`),
}
