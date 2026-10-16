import type { PaginationMetadata } from "@/types/common"

export interface SyncCatalogRequest {
  sucursalId: string
  publicar: boolean
}

export interface ResolveReversalRequest {
  accion: "compensacion_manual" | "compensacion_inventario"
  compensarInventario: boolean
  observacion: string
  sucursalInventarioId?: string
}

export interface InventoryIntegrationState {
  modulo: string
  estado: string
  integracionActiva: boolean
  credencialesConfiguradas: boolean
  conexionVerificada: boolean
  eventosFallidos: number
  reservasPendientes: number
  reversasPendientes: number
  discrepanciasReservaPedido: number
  productosDesincronizados: number
  ultimaSincronizacion: string | null
  endpointsBase: string[]
}

export interface InventoryConfiguration {
  id?: string
  organizacionId?: string
  codigoOrganizacionInventario?: string | null
  emailIntegracion?: string | null
  secretoReferencia?: string | null
  sucursalInventarioId?: string | null
  reservaMinutosDefault: number
  stockVisibleModo: string
  sincronizacionAutomatica: boolean
  intervaloSincronizacionMinutos: number
  publicarAlSincronizar: boolean
  alertaEventosFallidos: boolean
  activo: boolean
  metadata?: Record<string, unknown>
}

export interface InventoryConfigurationResponse {
  baseUrl: string
  credencialesConfiguradas: boolean
  conexionVerificada: boolean
  configuracion: InventoryConfiguration
}

export interface ReconciliationSummary {
  totalPedidosPagadosSinReserva: number
  totalPedidosReversaPendiente: number
  totalEventosAtencion: number
  totalProductosDesincronizados: number
}

export interface InventoryReconciliation {
  pedidosPagadosSinReserva: Array<Record<string, unknown>>
  pedidosReversaPendiente: Array<Record<string, unknown>>
  eventosAtencion: Array<Record<string, unknown>>
  productosDesincronizados: Array<Record<string, unknown>>
  resumen: ReconciliationSummary
}

export interface IntegrationEvent {
  id: string
  tipo?: string
  estado: string
  agregadoId?: string | null
  pedidoId?: string | null
  intentos?: number
  ultimoError?: string | null
  reintentable?: boolean
  fechaCreacion?: string
  fechaActualizacion?: string
  [key: string]: unknown
}

export interface IntegrationLog {
  id: string
  nivel?: string
  operacion?: string
  estado?: string
  mensaje?: string
  requestId?: string | null
  fechaCreacion?: string
  [key: string]: unknown
}

export interface IntegrationPage<T> {
  items: T[]
  pagination: PaginationMetadata
}
