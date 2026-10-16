import { useState } from "react"
import { Link } from "react-router-dom"

import { CustomerRequired } from "@/components/account/CustomerRequired"
import { RequestError } from "@/components/shared/RequestError"
import { useCustomerSelection } from "@/context/customer-provider"
import { useOrders } from "@/hooks/useOrders"
import { formatCurrency, formatDate } from "@/lib/utils"

const pageSize = 25

export default function AccountOrdersPage() {
  const { customerId } = useCustomerSelection()
  const [offset, setOffset] = useState(0)
  const orders = useOrders({ clienteId: customerId, limit: pageSize, offset })

  if (!customerId) return <CustomerRequired />

  return (
    <section>
      <h2 className="text-xl font-semibold">Pedidos</h2>
      {orders.isPending ? <p className="mt-4">Cargando pedidos...</p> : null}
      {orders.error ? <RequestError error={orders.error} /> : null}
      {orders.data?.items.length ? (
        <ul className="mt-4 divide-y rounded-md border">
          {orders.data.items.map((order) => (
            <li className="p-4" key={order.id}>
              <Link
                className="font-medium underline"
                to={`/mi-cuenta/pedidos/${order.id}`}
              >
                {order.codigoPedido ?? order.codigo ?? order.id}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.estado} · {formatCurrency(order.total, order.moneda)} · {" "}
                {formatDate(order.fechaCreacion)}
              </p>
            </li>
          ))}
        </ul>
      ) : orders.data ? (
        <p className="mt-4">No hay pedidos para este cliente.</p>
      ) : null}
      {orders.data ? (
        <div className="mt-4 flex gap-2">
          <button
            className="rounded-md border px-3 py-2 disabled:opacity-50"
            disabled={offset === 0}
            onClick={() => setOffset((current) => Math.max(0, current - pageSize))}
            type="button"
          >
            Anterior
          </button>
          <button
            className="rounded-md border px-3 py-2 disabled:opacity-50"
            disabled={!orders.data.pagination.hasMore}
            onClick={() => setOffset((current) => current + pageSize)}
            type="button"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </section>
  )
}
