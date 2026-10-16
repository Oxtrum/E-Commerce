import type { PaginatedData } from "@/types/common"

export type CollectionResponse<T> = T[] | PaginatedData<T>

export function normalizeCollection<T>(response: CollectionResponse<T>) {
  return Array.isArray(response) ? response : response.items
}

export function normalizePage<T>(
  response: CollectionResponse<T>,
  limit: number,
  offset: number,
): PaginatedData<T> {
  if (!Array.isArray(response)) return response

  const items = response.slice(offset, offset + limit)
  return {
    items,
    pagination: {
      limit,
      offset,
      total: response.length,
      hasMore: offset + items.length < response.length,
    },
  }
}
