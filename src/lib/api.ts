import type { ApiResponse } from "@/types/common"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

type QueryPrimitive = string | number | boolean
type QueryValue = QueryPrimitive | readonly QueryPrimitive[] | null | undefined
export type QueryParams = Record<string, QueryValue>

export interface RequestOptions {
  params?: QueryParams
  signal?: AbortSignal
}

export class ApiError extends Error {
  readonly status: number
  readonly codigo: number

  constructor(
    status: number,
    message: string,
    codigo: number,
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.codigo = codigo
  }
}

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(`${BASE_URL}${path}`)

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
  const response = await fetch(buildUrl(path, options?.params), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    signal: options?.signal,
  })

  let payload: ApiResponse<T>
  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError(
      response.status,
      "No fue posible procesar la respuesta del servidor",
      response.status,
    )
  }

  if (!response.ok || payload.error) {
    throw new ApiError(
      response.status,
      payload.mensaje || "No fue posible completar la operación",
      payload.codigo,
    )
  }

  return payload.data
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
}
