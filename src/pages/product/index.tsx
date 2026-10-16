import { useState } from "react"
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"

import { VariantSelector } from "@/components/catalog/VariantSelector"
import { RequestError } from "@/components/shared/RequestError"
import { useAuth } from "@/context/auth-provider"
import { useOrganization } from "@/context/organization-provider"
import { useAddCartItem } from "@/hooks/useCart"
import { useCatalogProduct } from "@/hooks/useCatalog"
import { formatCurrency } from "@/lib/utils"

export default function ProductPage() {
  const { slug = "" } = useParams()
  const { organization } = useOrganization()
  const product = useCatalogProduct(
    slug,
    organization?.slug
      ? { organizacionSlug: organization.slug }
      : { organizacionCodigo: organization?.codigo },
  )
  const { isAuthenticated } = useAuth()
  const addItem = useAddCartItem()
  const location = useLocation()
  const navigate = useNavigate()
  const [variantId, setVariantId] = useState("")
  const [quantity, setQuantity] = useState(1)

  if (product.isPending) return <p className="p-6">Cargando producto...</p>
  if (product.error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <RequestError error={product.error} />
      </div>
    )
  }
  if (!product.data) return <p className="p-6">Producto inexistente.</p>

	const variants = product.data.variantes ?? []
  const selectedVariant = variants.find(
    (variant) => variant.productoVarianteId === variantId,
  )

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: location.pathname } } })
      return
    }
    if (!variantId) return

    try {
      const result = await addItem.mutateAsync({
        productoVarianteId: variantId,
        cantidad: quantity,
      })
      navigate(`/carrito?carritoId=${result.cartId}`)
    } catch {
      // La mutation mantiene el error visible en la página.
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm text-muted-foreground">{product.data.codigo}</p>
      <h1 className="mt-1 text-3xl font-semibold">{product.data.nombre}</h1>
      <p className="mt-3">{product.data.descripcionCorta}</p>
      <p className="mt-3 font-medium">
        {formatCurrency(
          selectedVariant?.precio ?? product.data.precio,
          product.data.moneda,
        )}
      </p>

      <div className="mt-6 max-w-sm">
        {variants.length ? (
          <VariantSelector
            key={product.data.id}
            onValueChange={setVariantId}
            value={variantId}
            variants={variants}
          />
        ) : (
          <p>Esta publicación no informó variantes comprables.</p>
        )}

        <label className="mt-4 block text-sm">
          Cantidad
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            min={1}
            onChange={(event) => setQuantity(Number(event.target.value))}
            type="number"
            value={quantity}
          />
        </label>

        {addItem.error ? (
          <div className="mt-4">
            <RequestError error={addItem.error} />
          </div>
        ) : null}
        <button
          className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          disabled={!variantId || quantity < 1 || addItem.isPending}
          onClick={handleAdd}
          type="button"
        >
          {addItem.isPending ? "Agregando..." : "Agregar al carrito"}
        </button>
      </div>
    </section>
  )
}
