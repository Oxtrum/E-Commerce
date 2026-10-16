import { useState, type FormEvent } from "react"

import { Can } from "@/components/shared/Can"
import { RequestError } from "@/components/shared/RequestError"
import {
  useIntegrationAction,
  useIntegrationConfiguration,
  useIntegrationEvents,
  useIntegrationLogs,
  useIntegrationReconciliation,
  useIntegrationState,
} from "@/hooks/useIntegration"
import {
  clearOperationKey,
  getOrCreateOperationKey,
} from "@/lib/idempotency"
import { integrationService } from "@/services/integration"
import type { InventoryConfiguration, SyncCatalogRequest, ResolveReversalRequest } from "@/types/integration"

const pageSize = 25

export default function AdminIntegrationPage() {
  const [eventOffset, setEventOffset] = useState(0)
  const [logOffset, setLogOffset] = useState(0)
  const [configurationDraft, setConfigurationDraft] =
    useState<InventoryConfiguration | null>(null)
  const [reversalOrderId, setReversalOrderId] = useState("")
  const [compensarInventario, setCompensarInventario] = useState(false)
  const [reversalObservation, setReversalObservation] = useState("")
  const [reversalConfirmed, setReversalConfirmed] = useState(false)
  const [reversalAttempt, setReversalAttempt] = useState<{
    orderId: string
    payload: ResolveReversalRequest
    key: string
  } | null>(null)

  const state = useIntegrationState()
  const configuration = useIntegrationConfiguration()
  const reconciliation = useIntegrationReconciliation()
  const events = useIntegrationEvents(pageSize, eventOffset)
  const logs = useIntegrationLogs(pageSize, logOffset)

  const saveConfiguration = useIntegrationAction<InventoryConfiguration>(
    (payload) => integrationService.updateConfiguration(payload),
  )
  const testConnection = useIntegrationAction<Record<string, never>>(() =>
    integrationService.testConnection(),
  )
  const synchronize = useIntegrationAction<SyncCatalogRequest>((payload) =>
    integrationService.synchronizeCatalog(payload),
  )
  const retryEvent = useIntegrationAction<string>((id) =>
    integrationService.retryEvent(id),
  )
  const expireReservations = useIntegrationAction<Record<string, never>>(() =>
    integrationService.expireReservations(),
  )
  const resolveReversal = useIntegrationAction<{
    orderId: string
    key: string
    payload: ResolveReversalRequest
  }>(({ orderId, key, payload }) =>
    integrationService.resolveReversal(orderId, payload, key),
  )

  const currentConfiguration =
    configurationDraft ?? configuration.data?.configuracion ?? null
  const savedConfiguration = configuration.data?.configuracion
  const syncBranch = savedConfiguration?.sucursalInventarioId?.trim()

  const setConfigurationField = <K extends keyof InventoryConfiguration>(
    field: K,
    value: InventoryConfiguration[K],
  ) => {
    if (!currentConfiguration) return
    setConfigurationDraft({ ...currentConfiguration, [field]: value })
  }

  const submitConfiguration = (event: FormEvent) => {
    event.preventDefault()
    if (currentConfiguration) saveConfiguration.mutate(currentConfiguration, {
      onSuccess: () => setConfigurationDraft(null),
    })
  }

  const submitReversal = async (event: FormEvent) => {
    event.preventDefault()
    if (!reversalConfirmed || !reversalOrderId.trim() || !reversalObservation.trim()) return
    const attempt = reversalAttempt ?? {
      orderId: reversalOrderId.trim(),
      payload: {
        accion: compensarInventario ? "compensacion_inventario" : "compensacion_manual",
        compensarInventario,
        observacion: reversalObservation.trim(),
      } satisfies ResolveReversalRequest,
      key: getOrCreateOperationKey("resolver-reversa", reversalOrderId.trim()),
    }
    setReversalAttempt(attempt)
    try {
      await resolveReversal.mutateAsync(attempt)
      clearOperationKey("resolver-reversa", attempt.orderId)
      setReversalAttempt(null)
      setReversalOrderId("")
      setReversalObservation("")
      setReversalConfirmed(false)
      setCompensarInventario(false)
    } catch {
      // La clave se conserva para reintentar la misma intención.
    }
  }

  const errors = [
    state.error,
    configuration.error,
    reconciliation.error,
    events.error,
    logs.error,
    saveConfiguration.error,
    testConnection.error,
    synchronize.error,
    retryEvent.error,
    expireReservations.error,
    resolveReversal.error,
  ].filter(Boolean)

  return (
    <section className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold">Integración con Inventario SaaS</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado, sincronización, conciliación y recuperación operativa mediada
          por e-commerceApi.
        </p>
      </div>

      {errors[0] ? <RequestError error={errors[0]} /> : null}

      <section>
        <h3 className="font-semibold">Estado</h3>
        {state.data ? (
          <dl className="mt-3 grid gap-3 rounded-md border p-4 sm:grid-cols-3 text-sm">
            <div><dt className="text-muted-foreground">Estado</dt><dd>{state.data.estado}</dd></div>
            <div><dt className="text-muted-foreground">Integración activa</dt><dd>{state.data.integracionActiva ? "Sí" : "No"}</dd></div>
            <div><dt className="text-muted-foreground">Credenciales</dt><dd>{state.data.credencialesConfiguradas ? "Configuradas" : "Pendientes"}</dd></div>
            <div><dt className="text-muted-foreground">Conexión verificada</dt><dd>{state.data.conexionVerificada ? "Sí" : "No"}</dd></div>
          </dl>
        ) : null}
        <Can permission="integraciones_inventario:administrar">
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-md border px-3 py-2" disabled={testConnection.isPending} onClick={() => testConnection.mutate({})} type="button">Probar conexión</button>
            <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" disabled={synchronize.isPending || configuration.isFetching || configuration.isError || !syncBranch || !savedConfiguration?.activo || configurationDraft !== null} onClick={() => { if (syncBranch && savedConfiguration) synchronize.mutate({ sucursalId: syncBranch, publicar: savedConfiguration.publicarAlSincronizar }) }} type="button">Sincronizar catálogo</button>
            <button className="rounded-md border px-3 py-2" disabled={expireReservations.isPending} onClick={() => expireReservations.mutate({})} type="button">Expirar reservas vencidas</button>
          </div>
        </Can>
      </section>

      {state.data ? (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border p-3"><dt className="text-sm text-muted-foreground">Eventos con fallo</dt><dd className="mt-1 text-lg font-semibold">{state.data.eventosFallidos}</dd></div>
          <div className="rounded-md border p-3"><dt className="text-sm text-muted-foreground">Reservas pendientes</dt><dd className="mt-1 text-lg font-semibold">{state.data.reservasPendientes}</dd></div>
          <div className="rounded-md border p-3"><dt className="text-sm text-muted-foreground">Reversas pendientes</dt><dd className="mt-1 text-lg font-semibold">{state.data.reversasPendientes}</dd></div>
          <div className="rounded-md border p-3"><dt className="text-sm text-muted-foreground">Pedidos pagados sin reserva confirmada</dt><dd className="mt-1 text-lg font-semibold">{state.data.discrepanciasReservaPedido}</dd></div>
          <div className="rounded-md border p-3"><dt className="text-sm text-muted-foreground">Productos desincronizados</dt><dd className="mt-1 text-lg font-semibold">{state.data.productosDesincronizados}</dd></div>
          <div className="rounded-md border p-3"><dt className="text-sm text-muted-foreground">Última sincronización</dt><dd className="mt-1 text-sm font-medium">{state.data.ultimaSincronizacion ? new Date(state.data.ultimaSincronizacion).toLocaleString() : "Sin sincronizaciones"}</dd></div>
        </dl>
      ) : null}

      <Can permission="integraciones_inventario:administrar">
        <section>
          <h3 className="font-semibold">Configuración protegida</h3>
          {currentConfiguration ? (
            <form className="mt-3 grid gap-3 rounded-md border p-4 md:grid-cols-2" onSubmit={submitConfiguration}>
              <label className="text-sm">Código de organización en Inventario<input className="mt-1 w-full rounded-md border p-2" value={currentConfiguration.codigoOrganizacionInventario ?? ""} onChange={(event) => setConfigurationField("codigoOrganizacionInventario", event.target.value || null)} /></label>
              <label className="text-sm">Correo de integración<input className="mt-1 w-full rounded-md border p-2" type="email" value={currentConfiguration.emailIntegracion ?? ""} onChange={(event) => setConfigurationField("emailIntegracion", event.target.value || null)} /></label>
              <label className="text-sm">Sucursal de Inventario<input className="mt-1 w-full rounded-md border p-2" value={currentConfiguration.sucursalInventarioId ?? ""} onChange={(event) => setConfigurationField("sucursalInventarioId", event.target.value || null)} /></label>
              <label className="text-sm">Minutos de reserva<input className="mt-1 w-full rounded-md border p-2" min={1} type="number" value={currentConfiguration.reservaMinutosDefault} onChange={(event) => setConfigurationField("reservaMinutosDefault", Number(event.target.value))} /></label>
              <label className="text-sm">Modo de stock<input className="mt-1 w-full rounded-md border p-2" value={currentConfiguration.stockVisibleModo} onChange={(event) => setConfigurationField("stockVisibleModo", event.target.value)} /></label>
              <label className="text-sm">Intervalo de sincronización<input className="mt-1 w-full rounded-md border p-2" min={1} type="number" value={currentConfiguration.intervaloSincronizacionMinutos} onChange={(event) => setConfigurationField("intervaloSincronizacionMinutos", Number(event.target.value))} /></label>
              <label className="flex items-center gap-2 text-sm"><input checked={currentConfiguration.sincronizacionAutomatica} onChange={(event) => setConfigurationField("sincronizacionAutomatica", event.target.checked)} type="checkbox" />Sincronización automática</label>
              <label className="flex items-center gap-2 text-sm"><input checked={currentConfiguration.publicarAlSincronizar} onChange={(event) => setConfigurationField("publicarAlSincronizar", event.target.checked)} type="checkbox" />Publicar al sincronizar</label>
              <label className="flex items-center gap-2 text-sm"><input checked={currentConfiguration.alertaEventosFallidos} onChange={(event) => setConfigurationField("alertaEventosFallidos", event.target.checked)} type="checkbox" />Alertar eventos fallidos</label>
              <label className="flex items-center gap-2 text-sm"><input checked={currentConfiguration.activo} onChange={(event) => setConfigurationField("activo", event.target.checked)} type="checkbox" />Integración activa</label>
              <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground md:col-span-2" disabled={saveConfiguration.isPending} type="submit">Guardar configuración</button>
            </form>
          ) : null}
        </section>
      </Can>

      <section>
        <h3 className="font-semibold">Conciliación</h3>
        {reconciliation.data ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(reconciliation.data.resumen).map(([key, value]) => (
              <div className="rounded-md border p-3" key={key}><p className="text-xs text-muted-foreground">{key}</p><p className="text-xl font-semibold">{value}</p></div>
            ))}
          </div>
        ) : null}
      </section>

      <section>
        <h3 className="font-semibold">Eventos</h3>
        <ul className="mt-3 divide-y rounded-md border text-sm">
          {(events.data?.items ?? []).map((event) => (
            <li className={event.estado === "fallido" || event.estado === "reintentable" || event.estado === "pendiente_compensacion" ? "bg-destructive/10 p-3" : "p-3"} key={event.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-medium">{event.tipo ?? event.id}</p><p>{event.estado} · intentos {event.intentos ?? 0}</p>{event.ultimoError ? <p className="text-destructive">{event.ultimoError}</p> : null}</div>
                {(event.estado === "fallido" || event.estado === "reintentable") ? <Can permission="integraciones_inventario:administrar"><button className="rounded-md border px-3 py-1" onClick={() => retryEvent.mutate(event.id)} type="button">Reintentar</button></Can> : null}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2"><button className="rounded-md border px-3 py-1" disabled={eventOffset === 0} onClick={() => setEventOffset((value) => Math.max(0, value - pageSize))} type="button">Anterior</button><button className="rounded-md border px-3 py-1" disabled={!events.data?.pagination.hasMore} onClick={() => setEventOffset((value) => value + pageSize)} type="button">Siguiente</button></div>
      </section>

      <section>
        <h3 className="font-semibold">Logs</h3>
        <ul className="mt-3 divide-y rounded-md border font-mono text-xs">
          {(logs.data?.items ?? []).map((log) => <li className="p-3" key={log.id}><span>{log.nivel ?? "info"}</span> · <span>{log.operacion ?? log.estado}</span> · <span>{log.mensaje}</span>{log.requestId ? <span> · request {log.requestId}</span> : null}</li>)}
        </ul>
        <div className="mt-3 flex gap-2"><button className="rounded-md border px-3 py-1" disabled={logOffset === 0} onClick={() => setLogOffset((value) => Math.max(0, value - pageSize))} type="button">Anterior</button><button className="rounded-md border px-3 py-1" disabled={!logs.data?.pagination.hasMore} onClick={() => setLogOffset((value) => value + pageSize)} type="button">Siguiente</button></div>
      </section>

      <Can permission="integraciones_inventario:administrar">
        <form className="grid gap-3 rounded-md border p-4 sm:max-w-xl" onSubmit={submitReversal}>
          <h3 className="font-semibold">Resolver reversa postventa</h3>
          <label className="text-sm">Pedido<input className="mt-1 w-full rounded-md border p-2" disabled={reversalAttempt !== null} required value={reversalOrderId} onChange={(event) => { setReversalOrderId(event.target.value); setReversalConfirmed(false) }} /></label>
          <label className="text-sm">Resolución<select className="mt-1 w-full rounded-md border p-2" disabled={reversalAttempt !== null} value={compensarInventario ? "inventario" : "manual"} onChange={(event) => { setCompensarInventario(event.target.value === "inventario"); setReversalConfirmed(false) }}><option value="manual">Registrar resolución manual, sin mover stock</option><option value="inventario">Reintegrar stock en Inventario SaaS</option></select></label>
          <label className="text-sm">Observación<textarea className="mt-1 w-full rounded-md border p-2" disabled={reversalAttempt !== null} required value={reversalObservation} onChange={(event) => setReversalObservation(event.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reversalConfirmed} disabled={reversalAttempt !== null} onChange={(event) => setReversalConfirmed(event.target.checked)} />{compensarInventario ? "Confirmo el reintegro de stock" : "Confirmo la resolución manual sin reintegro de stock"}</label>
          <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" disabled={resolveReversal.isPending || !reversalConfirmed || !reversalObservation.trim()} type="submit">{reversalAttempt ? "Reintentar resolución" : "Resolver reversa"}</button>
        </form>
      </Can>
    </section>
  )
}
