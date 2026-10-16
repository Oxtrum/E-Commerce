import { Link, useLocation, useSearchParams } from "react-router-dom"

import type { CheckoutResult } from "@/types/checkout"

interface ResultLocationState {
  result?: CheckoutResult
}

export default function CheckoutResultPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = location.state as ResultLocationState | null
  const result = state?.result
  const orderId =
    searchParams.get("pedidoId") ??
    result?.pedido?.id ??
    result?.pedidoId ??
    result?.id ??
    ""
  const orderCode =
    result?.pedido?.codigoPedido ??
    result?.pedido?.codigo ??
    result?.codigoPedido ??
    result?.codigo
  const status = result?.pedido?.estado ?? result?.estado

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Resultado del checkout</h1>
      {result ? (
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt>Pedido</dt>
          <dd>{orderCode ?? orderId ?? "Creado"}</dd>
          <dt>Estado</dt>
          <dd>{status ?? "informado por la API"}</dd>
          <dt>Reserva</dt>
          <dd>
            {result.reservaInventarioId ?? result.reservaId ?? "No informada"}
          </dd>
        </dl>
      ) : (
        <p className="mt-4">
          No hay un resultado en memoria. Consulta el pedido para conocer su
          estado actual.
        </p>
      )}

      <div className="mt-6 flex gap-4">
        {orderId ? (
          <Link className="underline" to={`/mi-cuenta/pedidos/${orderId}`}>
            Consultar pedido
          </Link>
        ) : null}
        <Link className="underline" to="/mi-cuenta/pedidos">
          Ver pedidos
        </Link>
      </div>
    </section>
  )
}
