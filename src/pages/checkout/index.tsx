import { useState, type FormEvent } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { RequestError } from "@/components/shared/RequestError"
import { useCustomerSelection } from "@/context/customer-provider"
import { useCart } from "@/hooks/useCart"
import { useCheckout } from "@/hooks/useCheckout"
import { useCustomerAddresses } from "@/hooks/useCustomers"
import {
  clearCheckoutKey,
  getOrCreateCheckoutKey,
} from "@/lib/idempotency"
import { isEditableCart } from "@/services/cart"
import { serializeAddress } from "@/services/customers"
import type { CheckoutRequest, CheckoutResult } from "@/types/checkout"

function getOrderId(result: CheckoutResult) {
  return result.pedido?.id ?? result.pedidoId ?? result.id ?? ""
}

export default function CheckoutPage() {
  const { cartId = "" } = useParams()
  const cart = useCart(cartId)
  const checkout = useCheckout()
  const { customerId: selectedCustomerId } = useCustomerSelection()
  const addresses = useCustomerAddresses(selectedCustomerId)
  const navigate = useNavigate()
  const [sucursalId, setSucursalId] = useState("")
  const [clienteId, setClienteId] = useState(selectedCustomerId)
  const [direccionEntrega, setDireccionEntrega] = useState("")
  const [codigoCupon, setCodigoCupon] = useState("")
  const [notas, setNotas] = useState("")
  const [minutosExpiracion, setMinutosExpiracion] = useState(30)
  const [idempotencyKey] = useState(
    () => (cartId ? getOrCreateCheckoutKey(cartId) : ""),
  )

  if (!cartId) return <Navigate replace to="/carrito" />
  if (cart.isPending) return <p className="p-6">Cargando carrito...</p>
  if (cart.error) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <RequestError error={cart.error} />
      </div>
    )
  }
  if (!cart.data) return <Navigate replace to="/carrito" />
  if (!isEditableCart(cart.data)) {
    return (
      <section className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Checkout no disponible</h1>
        <p className="mt-3">
          El carrito está en estado {cart.data.estado} y ya no admite un nuevo
          checkout.
        </p>
      </section>
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload: CheckoutRequest = {
      sucursalId: sucursalId.trim() || undefined,
      clienteId: clienteId.trim() || undefined,
      direccionEntrega: direccionEntrega.trim(),
      codigoCupon: codigoCupon.trim() || undefined,
      notas: notas.trim() || undefined,
      minutosExpiracion,
    }

    try {
      const result = await checkout.mutateAsync({
        cartId,
        payload,
        idempotencyKey,
      })
      clearCheckoutKey(cartId)

      navigate(
        `/checkout/resultado${getOrderId(result) ? `?pedidoId=${encodeURIComponent(getOrderId(result))}` : ""}`,
        { replace: true, state: { result } },
      )
    } catch {
      // La mutation conserva el error y la misma clave para un reintento seguro.
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Carrito {cart.data.codigo}. Los montos y el stock serán recalculados por
        ecommerce_saas.
      </p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block text-sm">
          Sucursal de inventario (opcional)
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            onChange={(event) => setSucursalId(event.target.value)}
            placeholder="Sucursal configurada de la tienda"
            value={sucursalId}
          />
        </label>
        {selectedCustomerId && addresses.data?.length ? (
          <label className="block text-sm">
            Usar dirección guardada
            <select
              className="mt-1 w-full rounded-md border bg-background p-2"
              onChange={(event) => {
                const address = addresses.data.find(
                  (candidate) => candidate.id === event.target.value,
                )
                if (address) setDireccionEntrega(serializeAddress(address))
              }}
              value=""
            >
              <option value="">Seleccionar dirección</option>
              {addresses.data.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.etiqueta} — {address.direccionLinea1}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm">
          ID de cliente (opcional)
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            onChange={(event) => setClienteId(event.target.value)}
            value={clienteId}
          />
        </label>
        <label className="block text-sm">
          Dirección de entrega
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border bg-background p-2"
            onChange={(event) => setDireccionEntrega(event.target.value)}
            required
            value={direccionEntrega}
          />
        </label>
        <label className="block text-sm">
          Código de cupón (opcional)
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            onChange={(event) => setCodigoCupon(event.target.value)}
            value={codigoCupon}
          />
        </label>
        <label className="block text-sm">
          Notas (opcional)
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border bg-background p-2"
            onChange={(event) => setNotas(event.target.value)}
            value={notas}
          />
        </label>
        <label className="block text-sm">
          Minutos de expiración
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            max={1440}
            min={1}
            onChange={(event) => setMinutosExpiracion(Number(event.target.value))}
            required
            type="number"
            value={minutosExpiracion}
          />
        </label>

        {checkout.error ? <RequestError error={checkout.error} /> : null}
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          disabled={checkout.isPending}
          type="submit"
        >
          {checkout.isPending ? "Procesando..." : "Confirmar checkout"}
        </button>
      </form>
    </section>
  )
}
