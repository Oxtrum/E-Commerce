import { useParams } from "react-router-dom"

import { RequestError } from "@/components/shared/RequestError"
import {
  useInvoices,
  useOrder,
  useOrderPayments,
  useOrderShipments,
} from "@/hooks/useOrders"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function AccountOrderDetailPage() {
  const { id = "" } = useParams()
  const order = useOrder(id)
  const payments = useOrderPayments(id)
  const invoices = useInvoices({ pedidoId: id, limit: 50, offset: 0 })
  const shipments = useOrderShipments(id)

  if (order.isPending) return <p>Cargando pedido...</p>
  if (order.error) return <RequestError error={order.error} />
  if (!order.data) return <p>Pedido inexistente.</p>

  const items = order.data.items ?? order.data.detalles ?? []

  return (
    <section>
      <h2 className="text-xl font-semibold">
        Pedido {order.data.codigoPedido ?? order.data.codigo ?? order.data.id}
      </h2>
      <p className="mt-2 text-sm">
        Estado: {order.data.estado} · Fecha: {formatDate(order.data.fechaCreacion)}
      </p>
      <p className="mt-1 text-sm">
        Dirección: {order.data.direccionEntrega ?? "No informada"}
      </p>

      <h3 className="mt-6 font-semibold">Detalle histórico</h3>
      {items.length ? (
        <ul className="mt-3 divide-y rounded-md border">
          {items.map((item, index) => (
            <li className="p-3" key={item.id ?? `${item.sku}-${index}`}>
              <p>{item.nombre ?? item.varianteNombre ?? item.sku ?? "Item"}</p>
              <p className="text-sm text-muted-foreground">
                {item.cantidad} × {formatCurrency(item.precioUnitario, order.data.moneda)}
                {" = "}
                {formatCurrency(item.total, order.data.moneda)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2">El pedido no informó líneas.</p>
      )}
      <p className="mt-4 font-semibold">
        Total: {formatCurrency(order.data.total, order.data.moneda)}
      </p>

      <h3 className="mt-8 font-semibold">Pagos</h3>
      {payments.error ? <RequestError error={payments.error} /> : null}
      {payments.data?.items.length ? (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {payments.data.items.map((payment) => (
            <li key={payment.id}>
              {payment.codigo ?? payment.id}: {payment.estado} — {" "}
              {formatCurrency(payment.monto, payment.moneda)}
            </li>
          ))}
        </ul>
      ) : payments.data ? (
        <p className="mt-2 text-sm">Sin pagos informados.</p>
      ) : null}

      <h3 className="mt-8 font-semibold">Facturas</h3>
      {invoices.error ? <RequestError error={invoices.error} /> : null}
      {invoices.data?.items.length ? (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {invoices.data.items.map((invoice) => (
            <li key={invoice.id}>
              {invoice.numeroFactura ?? invoice.codigo ?? invoice.id}: {invoice.estado}
            </li>
          ))}
        </ul>
      ) : invoices.data ? (
        <p className="mt-2 text-sm">Sin facturas informadas.</p>
      ) : null}

      <h3 className="mt-8 font-semibold">Seguimiento de envío</h3>
      {shipments.error ? <RequestError error={shipments.error} /> : null}
      {shipments.data?.items.length ? (
        <ol className="mt-2 list-decimal pl-5 text-sm">
          {shipments.data.items.map((shipment) => (
            <li key={shipment.id}>
              {shipment.estado} — {shipment.transportista ?? "Sin transportista"}
              {shipment.trackingCodigo
                ? ` — tracking ${shipment.trackingCodigo}`
                : ""}
            </li>
          ))}
        </ol>
      ) : shipments.data ? (
        <p className="mt-2 text-sm">Sin envíos informados.</p>
      ) : null}
    </section>
  )
}
