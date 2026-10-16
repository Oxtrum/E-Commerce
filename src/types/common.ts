export interface ApiResponse<T> {
  data: T
  codigo: number
  error: boolean
  mensaje: string
  version: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginationMetadata {
  limit: number
  offset: number
  total: number
  hasMore: boolean
}

export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationMetadata
}
