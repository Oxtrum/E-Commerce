import { useParams } from "react-router-dom"

import { RequestError } from "@/components/shared/RequestError"
import { useInvoice } from "@/hooks/useOrders"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function AccountInvoiceDetailPage() {
  const { id = "" } = useParams()
  const invoice = useInvoice(id)

  if (invoice.isPending) return <p>Cargando factura...</p>
  if (invoice.error) return <RequestError error={invoice.error} />
  if (!invoice.data) return <p>Factura inexistente.</p>

  return (
    <section>
      <h2 className="text-xl font-semibold">
        Factura {invoice.data.numeroFactura ?? invoice.data.codigo ?? invoice.data.id}
      </h2>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt>Estado</dt>
        <dd>{invoice.data.estado}</dd>
        <dt>Fecha</dt>
        <dd>{formatDate(invoice.data.fechaCreacion)}</dd>
        <dt>Nombre fiscal</dt>
        <dd>{invoice.data.fiscalNombre ?? "No informado"}</dd>
        <dt>Documento</dt>
        <dd>
          {[invoice.data.fiscalTipoDocumento, invoice.data.fiscalDocumento]
            .filter(Boolean)
            .join(" ") || "No informado"}
        </dd>
        <dt>Total</dt>
        <dd>{formatCurrency(invoice.data.total, invoice.data.moneda)}</dd>
      </dl>
      <p className="mt-6 rounded-md border p-3 text-sm">
        Esta vista es de solo lectura. Las facturas emitidas o anuladas no se
        editan desde la cuenta del cliente.
      </p>
    </section>
  )
}
