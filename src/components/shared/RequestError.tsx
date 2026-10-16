import { ApiError } from "@/lib/api"

interface RequestErrorProps {
  error: unknown
  fallback?: string
}

export function RequestError({
  error,
  fallback = "No fue posible cargar la información.",
}: RequestErrorProps) {
  const message = error instanceof Error ? error.message : fallback
  const requestId = error instanceof ApiError ? error.requestId : null

  return (
    <div className="rounded-md border border-destructive p-3 text-sm">
      <p>{message}</p>
      {requestId ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Request ID: {requestId}
        </p>
      ) : null}
    </div>
  )
}
