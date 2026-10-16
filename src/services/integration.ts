import { api } from "@/lib/api"
import type {
  IntegrationEvent,
  IntegrationLog,
  IntegrationPage,
  InventoryConfiguration,
  InventoryConfigurationResponse,
  InventoryIntegrationState,
  InventoryReconciliation,
  SyncCatalogRequest,
  ResolveReversalRequest,
} from "@/types/integration"

const base = "/integraciones/inventario"

export const integrationService = {
  getState: (signal?: AbortSignal) =>
    api.get<InventoryIntegrationState>(`${base}/estado`, { signal }),
  getConfiguration: (signal?: AbortSignal) =>
    api.get<InventoryConfigurationResponse>(`${base}/configuracion`, { signal }),
  updateConfiguration: (payload: Partial<InventoryConfiguration>) =>
    api.patch<InventoryConfigurationResponse>(`${base}/configuracion`, payload),
  testConnection: () =>
    api.post<InventoryIntegrationState>(`${base}/conexion/probar`, {}),
  synchronizeCatalog: (payload: SyncCatalogRequest) =>
    api.post<Record<string, unknown>>(`${base}/catalogo/sincronizar`, payload),
  getReconciliation: (signal?: AbortSignal) =>
    api.get<InventoryReconciliation>(`${base}/conciliacion`, { signal }),
  listEvents: (limit: number, offset: number, signal?: AbortSignal) =>
    api.get<IntegrationPage<IntegrationEvent>>(`${base}/eventos`, {
      params: { limit, offset },
      signal,
    }),
  listLogs: (limit: number, offset: number, signal?: AbortSignal) =>
    api.get<IntegrationPage<IntegrationLog>>(`${base}/logs`, {
      params: { limit, offset },
      signal,
    }),
  retryEvent: (eventId: string) =>
    api.post<IntegrationEvent>(`${base}/eventos/${eventId}/reintentar`, {}),
  resolveReversal: (orderId: string, payload: ResolveReversalRequest, idempotencyKey: string) =>
    api.post<Record<string, unknown>>(
      `${base}/postventa/reversas/${orderId}/resolver`,
      payload,
      { idempotencyKey },
    ),
  expireReservations: () =>
    api.post<Record<string, unknown>>(`${base}/reservas/expirar-vencidas`, {}),
}
