import { useState } from "react"
import { Link } from "react-router-dom"

import { CustomerRequired } from "@/components/account/CustomerRequired"
import { RequestError } from "@/components/shared/RequestError"
import { useCustomerSelection } from "@/context/customer-provider"
import { useInvoices } from "@/hooks/useOrders"
import { formatCurrency, formatDate } from "@/lib/utils"

const pageSize = 25

export default function AccountInvoicesPage() {
  const { customerId } = useCustomerSelection()
  const [offset, setOffset] = useState(0)
  const invoices = useInvoices({ clienteId: customerId, limit: pageSize, offset })

  if (!customerId) return <CustomerRequired />

  return (
    <section>
      <h2 className="text-xl font-semibold">Facturas</h2>
      {invoices.isPending ? <p className="mt-4">Cargando facturas...</p> : null}
      {invoices.error ? <RequestError error={invoices.error} /> : null}
      {invoices.data?.items.length ? (
        <ul className="mt-4 divide-y rounded-md border">
          {invoices.data.items.map((invoice) => (
            <li className="p-4" key={invoice.id}>
              <Link
                className="font-medium underline"
                to={`/mi-cuenta/facturas/${invoice.id}`}
              >
                {invoice.numeroFactura ?? invoice.codigo ?? invoice.id}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {invoice.estado} · {formatCurrency(invoice.total, invoice.moneda)} · {" "}
                {formatDate(invoice.fechaCreacion)}
              </p>
            </li>
          ))}
        </ul>
      ) : invoices.data ? (
        <p className="mt-4">No hay facturas para este cliente.</p>
      ) : null}
      {invoices.data ? (
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
            disabled={!invoices.data.pagination.hasMore}
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
