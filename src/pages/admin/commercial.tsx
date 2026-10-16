import { useState, type FormEvent } from "react"

import { Can } from "@/components/shared/Can"
import { RequestError } from "@/components/shared/RequestError"
import { useAdminAction, useAdminPage } from "@/hooks/useAdmin"
import {
  clearOperationKey,
  getOrCreateOperationKey,
} from "@/lib/idempotency"
import { formatCurrency } from "@/lib/utils"
import { adminService } from "@/services/admin"
import type {
  AdminInvoice,
  AdminOrder,
  AdminPayment,
  AdminShipment,
  CreateDiscountRequest,
  Discount,
} from "@/types/admin"

const orderTransitions: Record<string, string[]> = {
  pendiente_reserva: ["pendiente_pago", "cancelado"],
  pendiente_pago: ["pagado", "cancelado"],
  pagado: ["preparacion", "reversa_pendiente"],
  preparacion: ["enviado", "cancelado"],
  enviado: ["entregado"],
}

const shipmentTransitions: Record<string, string[]> = {
  borrador: ["planificado"],
  planificado: ["preparado"],
  preparado: ["en_transito"],
  en_transito: ["entregado", "fallido"],
  fallido: ["planificado", "cancelado"],
}

export default function AdminCommercialPage() {
  const orders = useAdminPage<AdminOrder>(
    "pedidos",
    adminService.listOrders,
    100,
  )
  const payments = useAdminPage<AdminPayment>(
    "pagos",
    adminService.listPayments,
    100,
  )
  const invoices = useAdminPage<AdminInvoice>(
    "facturas",
    adminService.listInvoices,
    100,
  )
  const shipments = useAdminPage<AdminShipment>(
    "envios",
    adminService.listShipments,
    100,
  )
  const discounts = useAdminPage<Discount>(
    "descuentos",
    adminService.listDiscounts,
    100,
  )

  const updateOrder = useAdminAction<{ id: string; estado: string }>(
    ({ id, estado }) => adminService.updateOrderStatus(id, estado),
  )
  const updateShipment = useAdminAction<{ id: string; estado: string }>(
    ({ id, estado }) => adminService.updateShipmentStatus(id, estado),
  )
  const createPayment = useAdminAction<{
    pedidoId: string
    metodo: string
    referencia: string
    key: string
  }>(({ pedidoId, metodo, referencia, key }) =>
    adminService.createPayment(
      { pedidoId, metodo, referencia, estado: "pendiente" },
      key,
    ),
  )
  const confirmPayment = useAdminAction<{ id: string; key: string }>(
    ({ id, key }) => adminService.confirmPayment(id, key),
  )
  const createInvoice = useAdminAction<{
    pedidoId: string
    codigo: string
    numeroFactura: string
    fiscalNombre: string
    fiscalTipoDocumento: string
    fiscalDocumento: string
  }>(({ pedidoId, ...payload }) =>
    adminService.createInvoiceFromOrder(pedidoId, payload),
  )
  const issueInvoice = useAdminAction<string>((id) =>
    adminService.issueInvoice(id),
  )
  const cancelInvoice = useAdminAction<{ id: string; motivo: string }>(
    ({ id, motivo }) => adminService.cancelInvoice(id, motivo),
  )
  const createDiscount = useAdminAction<CreateDiscountRequest>((payload) =>
    adminService.createDiscount(payload),
  )
  const toggleDiscount = useAdminAction<{ id: string; restore: boolean }>(
    ({ id, restore }) =>
      restore
        ? adminService.restoreDiscount(id)
        : adminService.deactivateDiscount(id),
  )

  const [paymentForm, setPaymentForm] = useState({
    pedidoId: "",
    metodo: "manual",
    referencia: "",
  })
  const [invoiceForm, setInvoiceForm] = useState({
    pedidoId: "",
    codigo: "",
    numeroFactura: "",
    fiscalNombre: "",
    fiscalTipoDocumento: "CI",
    fiscalDocumento: "",
  })
  const [cancelForm, setCancelForm] = useState({ id: "", motivo: "" })
  const [discountForm, setDiscountForm] = useState<CreateDiscountRequest>({
    codigo: "",
    nombre: "",
    tipo: "porcentaje",
    valor: 0,
    codigoCupon: "",
    minimoCompra: 0,
    moneda: "BOB",
    activo: true,
  })

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault()
    const key = getOrCreateOperationKey("crear-pago", paymentForm.pedidoId)
    try {
      await createPayment.mutateAsync({ ...paymentForm, key })
      clearOperationKey("crear-pago", paymentForm.pedidoId)
      setPaymentForm({ pedidoId: "", metodo: "manual", referencia: "" })
    } catch {
      // La clave se conserva para reintentar la misma intención.
    }
  }

  const handleConfirmPayment = async (id: string) => {
    const key = getOrCreateOperationKey("confirmar-pago", id)
    try {
      await confirmPayment.mutateAsync({ id, key })
      clearOperationKey("confirmar-pago", id)
    } catch {
      // La clave se conserva para reintentar la misma intención.
    }
  }

  const errors = [
    orders.error,
    payments.error,
    invoices.error,
    shipments.error,
    discounts.error,
    updateOrder.error,
    updateShipment.error,
    createPayment.error,
    confirmPayment.error,
    createInvoice.error,
    issueInvoice.error,
    cancelInvoice.error,
    createDiscount.error,
    toggleDiscount.error,
  ].filter(Boolean)

  return (
    <section className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold">Operación comercial</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Acciones simples y condicionadas por estado para pedidos, cobros,
          facturación, envíos y descuentos.
        </p>
      </div>

      {errors[0] ? <RequestError error={errors[0]} /> : null}

      <Can permission="pedidos:leer">
        <section>
          <h3 className="font-semibold">Pedidos</h3>
          <ul className="mt-3 divide-y rounded-md border text-sm">
            {(orders.data?.items ?? []).map((order) => (
              <li className="p-3" key={order.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{order.codigo ?? order.id}</p>
                    <p>
                      {order.estado} · {formatCurrency(order.total, order.moneda)}
                    </p>
                  </div>
                  <Can permission="pedidos:actualizar">
                    <div className="flex flex-wrap gap-2">
                      {(orderTransitions[order.estado] ?? []).map((estado) => (
                        <button
                          className="rounded-md border px-3 py-1"
                          disabled={updateOrder.isPending}
                          key={estado}
                          onClick={() =>
                            updateOrder.mutate({ id: order.id, estado })
                          }
                          type="button"
                        >
                          Pasar a {estado}
                        </button>
                      ))}
                    </div>
                  </Can>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Can>

      <Can permission="pagos:leer">
        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold">Pagos</h3>
            <ul className="mt-3 divide-y rounded-md border text-sm">
              {(payments.data?.items ?? []).map((payment) => (
                <li className="flex items-center justify-between gap-3 p-3" key={payment.id}>
                  <div>
                    <p className="font-medium">{payment.codigo ?? payment.id}</p>
                    <p>{payment.estado} · {formatCurrency(payment.monto, payment.moneda)}</p>
                  </div>
                  {payment.estado === "pendiente" ? (
                    <Can permission="pagos:actualizar">
                      <button
                        className="rounded-md border px-3 py-1"
                        disabled={confirmPayment.isPending}
                        onClick={() => handleConfirmPayment(payment.id)}
                        type="button"
                      >
                        Confirmar
                      </button>
                    </Can>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          <Can permission="pagos:actualizar">
            <form className="space-y-3 rounded-md border p-4" onSubmit={submitPayment}>
              <h3 className="font-semibold">Registrar pago pendiente</h3>
              <input className="w-full rounded-md border p-2" placeholder="ID del pedido" required value={paymentForm.pedidoId} onChange={(event) => setPaymentForm((current) => ({ ...current, pedidoId: event.target.value }))} />
              <input className="w-full rounded-md border p-2" placeholder="Método" required value={paymentForm.metodo} onChange={(event) => setPaymentForm((current) => ({ ...current, metodo: event.target.value }))} />
              <input className="w-full rounded-md border p-2" placeholder="Referencia" value={paymentForm.referencia} onChange={(event) => setPaymentForm((current) => ({ ...current, referencia: event.target.value }))} />
              <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" disabled={createPayment.isPending} type="submit">Crear pago</button>
            </form>
          </Can>
        </section>
      </Can>

      <Can permission="facturas:leer">
        <section className="space-y-4">
          <h3 className="font-semibold">Facturas</h3>
          <ul className="divide-y rounded-md border text-sm">
            {(invoices.data?.items ?? []).map((invoice) => (
              <li className="flex flex-wrap items-center justify-between gap-3 p-3" key={invoice.id}>
                <div>
                  <p className="font-medium">{invoice.codigo ?? invoice.id}</p>
                  <p>{invoice.estado} · {formatCurrency(invoice.total, invoice.moneda)}</p>
                </div>
                {invoice.estado !== "emitida" && invoice.estado !== "anulada" ? (
                  <Can permission="facturas:emitir">
                    <button className="rounded-md border px-3 py-1" onClick={() => issueInvoice.mutate(invoice.id)} type="button">Emitir</button>
                  </Can>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="grid gap-4 lg:grid-cols-2">
            <Can permission="facturas:emitir">
              <form className="grid gap-3 rounded-md border p-4" onSubmit={(event) => { event.preventDefault(); createInvoice.mutate(invoiceForm) }}>
                <h4 className="font-medium">Crear desde pedido</h4>
                {Object.entries(invoiceForm).map(([field, value]) => (
                  <input className="rounded-md border p-2" key={field} placeholder={field} required value={value} onChange={(event) => setInvoiceForm((current) => ({ ...current, [field]: event.target.value }))} />
                ))}
                <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" type="submit">Crear factura</button>
              </form>
            </Can>
            <Can permission="facturas:anular">
              <form className="grid gap-3 rounded-md border p-4" onSubmit={(event) => { event.preventDefault(); cancelInvoice.mutate(cancelForm) }}>
                <h4 className="font-medium">Anular factura emitida</h4>
                <input className="rounded-md border p-2" placeholder="ID de factura" required value={cancelForm.id} onChange={(event) => setCancelForm((current) => ({ ...current, id: event.target.value }))} />
                <textarea className="rounded-md border p-2" placeholder="Motivo obligatorio" required value={cancelForm.motivo} onChange={(event) => setCancelForm((current) => ({ ...current, motivo: event.target.value }))} />
                <button className="rounded-md border px-3 py-2" type="submit">Anular</button>
              </form>
            </Can>
          </div>
        </section>
      </Can>

      <Can permission="envios:leer">
        <section>
          <h3 className="font-semibold">Envíos</h3>
          <ul className="mt-3 divide-y rounded-md border text-sm">
            {(shipments.data?.items ?? []).map((shipment) => (
              <li className="flex flex-wrap items-center justify-between gap-3 p-3" key={shipment.id}>
                <p>{shipment.codigo ?? shipment.id} · {shipment.estado}</p>
                <Can permission="envios:actualizar">
                  <div className="flex flex-wrap gap-2">
                    {(shipmentTransitions[shipment.estado] ?? []).map((estado) => (
                      <button className="rounded-md border px-3 py-1" key={estado} onClick={() => updateShipment.mutate({ id: shipment.id, estado })} type="button">Pasar a {estado}</button>
                    ))}
                  </div>
                </Can>
              </li>
            ))}
          </ul>
        </section>
      </Can>

      <Can permission="descuentos:leer">
        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold">Descuentos y cupones</h3>
            <ul className="mt-3 divide-y rounded-md border text-sm">
              {(discounts.data?.items ?? []).map((discount) => (
                <li className="flex items-center justify-between gap-3 p-3" key={discount.id}>
                  <p>{discount.codigoCupon || discount.codigo} · {discount.tipo} {discount.valor}</p>
                  <Can permission="descuentos:administrar">
                    <button className="underline" onClick={() => toggleDiscount.mutate({ id: discount.id, restore: !discount.activo })} type="button">{discount.activo ? "Desactivar" : "Restaurar"}</button>
                  </Can>
                </li>
              ))}
            </ul>
          </div>
          <Can permission="descuentos:administrar">
            <form className="grid gap-3 rounded-md border p-4" onSubmit={(event) => { event.preventDefault(); createDiscount.mutate(discountForm) }}>
              <h4 className="font-medium">Crear descuento</h4>
              <input className="rounded-md border p-2" placeholder="Código interno" required value={discountForm.codigo} onChange={(event) => setDiscountForm((current) => ({ ...current, codigo: event.target.value }))} />
              <input className="rounded-md border p-2" placeholder="Nombre" required value={discountForm.nombre} onChange={(event) => setDiscountForm((current) => ({ ...current, nombre: event.target.value }))} />
              <input className="rounded-md border p-2" placeholder="Código de cupón" value={discountForm.codigoCupon} onChange={(event) => setDiscountForm((current) => ({ ...current, codigoCupon: event.target.value }))} />
              <select className="rounded-md border p-2" value={discountForm.tipo} onChange={(event) => setDiscountForm((current) => ({ ...current, tipo: event.target.value as "porcentaje" | "monto" }))}><option value="porcentaje">Porcentaje</option><option value="monto">Monto</option></select>
              <input className="rounded-md border p-2" min="0" required type="number" value={discountForm.valor} onChange={(event) => setDiscountForm((current) => ({ ...current, valor: Number(event.target.value) }))} />
              <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" type="submit">Crear descuento</button>
            </form>
          </Can>
        </section>
      </Can>
    </section>
  )
}
