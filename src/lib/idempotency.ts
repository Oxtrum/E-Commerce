import { createOperationKey } from "@/lib/session"

const CHECKOUT_KEY_PREFIX = "ecom_core_checkout_key"
const OPERATION_KEY_PREFIX = "ecom_core_operation_key"

function getStorageKey(cartId: string) {
  return `${CHECKOUT_KEY_PREFIX}:${cartId}`
}

export function getOrCreateCheckoutKey(cartId: string) {
  const storageKey = getStorageKey(cartId)
  const currentKey = sessionStorage.getItem(storageKey)
  if (currentKey) return currentKey

  const nextKey = createOperationKey()
  sessionStorage.setItem(storageKey, nextKey)
  return nextKey
}

export function clearCheckoutKey(cartId: string) {
  sessionStorage.removeItem(getStorageKey(cartId))
}

function getOperationStorageKey(scope: string, resourceId: string) {
  return `${OPERATION_KEY_PREFIX}:${scope}:${resourceId}`
}

export function getOrCreateOperationKey(scope: string, resourceId: string) {
  const storageKey = getOperationStorageKey(scope, resourceId)
  const currentKey = sessionStorage.getItem(storageKey)
  if (currentKey) return currentKey

  const nextKey = createOperationKey()
  sessionStorage.setItem(storageKey, nextKey)
  return nextKey
}

export function clearOperationKey(scope: string, resourceId: string) {
  sessionStorage.removeItem(getOperationStorageKey(scope, resourceId))
}
