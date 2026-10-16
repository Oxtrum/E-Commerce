import { RequestError } from "@/components/shared/RequestError"
import { Link, useSearchParams } from "react-router-dom"
import {
  useCart,
  useCarts,
  useCreateCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/useCart"
import { formatCurrency } from "@/lib/utils"
import { isEditableCart, selectCurrentCart } from "@/services/cart"
import type { Cart } from "@/types/cart"

function CartDetail({ cartId }: { cartId: string }) {
  const cart = useCart(cartId)
  const updateItem = useUpdateCartItem(cartId)
  const removeItem = useRemoveCartItem(cartId)

  if (cart.isPending) return <p className="mt-4">Cargando carrito...</p>
  if (cart.error) return <RequestError error={cart.error} />
  if (!cart.data) return <p>El carrito no existe.</p>

  const editable = isEditableCart(cart.data)
  const items = cart.data.items
  const currency = cart.data.moneda

  return (
    <div className="mt-5">
      <p className="text-sm">
        Código: {cart.data.codigo} · Estado: {cart.data.estado}
      </p>
      {!editable ? (
        <p className="mt-2 rounded-md border p-3 text-sm">
          Este carrito ya no permite modificar items.
        </p>
      ) : null}

      {items.length ? (
        <ul className="mt-4 divide-y rounded-md border">
          {items.map((item) => (
            <li className="p-4" key={item.id}>
              <p className="font-medium">
                {item.productoNombre} / {item.varianteNombre}
              </p>
              <p className="text-sm text-muted-foreground">
                SKU: {item.sku ?? "no informado"} · Cantidad: {item.cantidad}
              </p>
              {item.atributos ? (
                <p className="text-sm text-muted-foreground">
                  {Object.entries(item.atributos)
                    .map(([name, value]) => `${name}: ${String(value)}`)
                    .join(" · ")}
                </p>
              ) : null}
              <p className="mt-1 text-sm">
                Total: {formatCurrency(item.total, currency)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                  disabled={!editable || item.cantidad <= 1 || updateItem.isPending}
                  onClick={() =>
                    updateItem.mutate({
                      itemId: item.id,
                      cantidad: item.cantidad - 1,
                    })
                  }
                  type="button"
                >
                  -
                </button>
                <button
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                  disabled={!editable || updateItem.isPending}
                  onClick={() =>
                    updateItem.mutate({
                      itemId: item.id,
                      cantidad: item.cantidad + 1,
                    })
                  }
                  type="button"
                >
                  +
                </button>
                <button
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                  disabled={!editable || removeItem.isPending}
                  onClick={() => removeItem.mutate(item.id)}
                  type="button"
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">El carrito no tiene items.</p>
      )}

      {updateItem.error ? <RequestError error={updateItem.error} /> : null}
      {removeItem.error ? <RequestError error={removeItem.error} /> : null}

      <dl className="mt-5 grid max-w-sm grid-cols-2 gap-2 border-t pt-4 text-sm">
        <dt>Subtotal</dt>
        <dd>{formatCurrency(cart.data.subtotal, currency)}</dd>
        <dt>Descuento</dt>
        <dd>{formatCurrency(cart.data.descuentoTotal, currency)}</dd>
        <dt>Impuestos</dt>
        <dd>{formatCurrency(cart.data.impuestoTotal, currency)}</dd>
        <dt className="font-semibold">Total</dt>
        <dd className="font-semibold">
          {formatCurrency(cart.data.total, currency)}
        </dd>
      </dl>
      {editable && items.length ? (
        <Link
          className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          to={`/checkout/${cart.data.id}`}
        >
          Continuar al checkout
        </Link>
      ) : null}
    </div>
  )
}

function selectCart(carts: Cart[], requestedId: string | null) {
  return carts.find((cart) => cart.id === requestedId) ?? selectCurrentCart(carts)
}

export default function CartPage() {
  const carts = useCarts()
  const createCart = useCreateCart()
  const [searchParams] = useSearchParams()
  const requestedId = searchParams.get("carritoId")

  if (carts.isPending) return <p className="p-6">Cargando carritos...</p>
  if (carts.error) {
    return (
      <div className="p-6">
        <RequestError error={carts.error} />
      </div>
    )
  }

  const currentCart = selectCart(carts.data ?? [], requestedId)

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Carrito</h1>
      {currentCart ? (
        <CartDetail cartId={currentCart.id} />
      ) : (
        <div className="mt-5">
          <p>No tienes un carrito activo.</p>
          <button
            className="mt-3 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            disabled={createCart.isPending}
            onClick={() => createCart.mutate()}
            type="button"
          >
            {createCart.isPending ? "Creando..." : "Crear carrito"}
          </button>
          {createCart.error ? <RequestError error={createCart.error} /> : null}
        </div>
      )}
    </section>
  )
}
