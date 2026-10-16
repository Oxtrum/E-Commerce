import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { integrationService } from "@/services/integration"

export const integrationKeys = {
  all: ["integracion-inventario"] as const,
  state: () => [...integrationKeys.all, "estado"] as const,
  configuration: () => [...integrationKeys.all, "configuracion"] as const,
  reconciliation: () => [...integrationKeys.all, "conciliacion"] as const,
  events: (limit: number, offset: number) =>
    [...integrationKeys.all, "eventos", limit, offset] as const,
  logs: (limit: number, offset: number) =>
    [...integrationKeys.all, "logs", limit, offset] as const,
}

export function useIntegrationState() {
  return useQuery({
    queryKey: integrationKeys.state(),
    queryFn: ({ signal }) => integrationService.getState(signal),
  })
}

export function useIntegrationConfiguration() {
  return useQuery({
    queryKey: integrationKeys.configuration(),
    queryFn: ({ signal }) => integrationService.getConfiguration(signal),
  })
}

export function useIntegrationReconciliation() {
  return useQuery({
    queryKey: integrationKeys.reconciliation(),
    queryFn: ({ signal }) => integrationService.getReconciliation(signal),
  })
}

export function useIntegrationEvents(limit = 25, offset = 0) {
  return useQuery({
    queryKey: integrationKeys.events(limit, offset),
    queryFn: ({ signal }) =>
      integrationService.listEvents(limit, offset, signal),
  })
}

export function useIntegrationLogs(limit = 25, offset = 0) {
  return useQuery({
    queryKey: integrationKeys.logs(limit, offset),
    queryFn: ({ signal }) =>
      integrationService.listLogs(limit, offset, signal),
  })
}

export function useIntegrationAction<TVariables>(
  action: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["admin", "productos"] })
      queryClient.invalidateQueries({ queryKey: ["catalogo"] })
      queryClient.invalidateQueries({ queryKey: ["pedidos"] })
    },
  })
}
