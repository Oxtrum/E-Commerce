import { clearAccessToken, getAccessToken } from "@/lib/session"
import type { ApiResponse, PaginatedData } from "@/types/common"

const BASE_URL = import.meta.env.VITE_API_URL || "/api"
export const UNAUTHORIZED_EVENT = "ecom-core:unauthorized"

type QueryPrimitive = string | number | boolean
type QueryValue = QueryPrimitive | readonly QueryPrimitive[] | null | undefined
export type QueryParams = Record<string, QueryValue>

export interface RequestOptions {
  params?: QueryParams
  signal?: AbortSignal
  idempotencyKey?: string
  requestId?: string
  skipUnauthorizedEvent?: boolean
}

export class ApiError extends Error {
  readonly status: number
  readonly codigo: number
  readonly requestId: string | null
  readonly retryAfter: string | null

  constructor(options: {
    status: number
    codigo: number
    message: string
    requestId?: string | null
    retryAfter?: string | null
  }) {
    super(options.message)
    this.name = "ApiError"
    this.status = options.status
    this.codigo = options.codigo
    this.requestId = options.requestId ?? null
    this.retryAfter = options.retryAfter ?? null
  }
}

function buildUrl(path: string, params?: QueryParams) {
  const apiBase = BASE_URL.startsWith("http")
    ? BASE_URL
    : `${window.location.origin}${BASE_URL.startsWith("/") ? BASE_URL : `/${BASE_URL}`}`
  const url = new URL(`${apiBase}${path}`)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)))
    } else if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })

  return url
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const token = getAccessToken()
  const requestId = options?.requestId ?? crypto.randomUUID()
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Request-ID": requestId,
  }

  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (token) headers.Authorization = `Bearer ${token}`
  if (options?.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey
  }

  const response = await fetch(buildUrl(path, options?.params), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: options?.signal,
  })

  const responseRequestId = response.headers.get("X-Request-ID") ?? requestId
  const retryAfter = response.headers.get("Retry-After")

  let payload: ApiResponse<T>
  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError({
      status: response.status,
      codigo: response.status,
      message: "No fue posible procesar la respuesta del servidor",
      requestId: responseRequestId,
      retryAfter,
    })
  }

  if (response.status === 401 && !options?.skipUnauthorizedEvent) {
    clearAccessToken()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  if (!response.ok || payload.error) {
    throw new ApiError({
      status: response.status,
      codigo: payload.codigo,
      message: payload.mensaje || "No fue posible completar la operación",
      requestId: responseRequestId,
      retryAfter,
    })
  }

  return payload.data
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  getPage: <T>(path: string, options?: RequestOptions) =>
    request<PaginatedData<T>>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
}
