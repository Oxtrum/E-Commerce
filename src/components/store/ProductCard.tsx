import { Package, ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"

import type { CatalogProduct } from "@/types/catalog"
import { cn, formatCurrency } from "@/lib/utils"

interface ProductCardProps {
  producto: CatalogProduct
  prioridad?: boolean
}

type TonoStock = "hay" | "poco" | "agotado"

function etiquetaStock(
  stock: number | null,
): { texto: string; tono: TonoStock } | null {
  if (stock === null) return null
  if (stock <= 0) return { texto: "Sin stock", tono: "agotado" }
  if (stock <= 5) return { texto: `Quedan ${stock}`, tono: "poco" }
  return { texto: "Disponible", tono: "hay" }
}

export function ProductCard({ producto, prioridad = false }: ProductCardProps) {
  const stock = etiquetaStock(producto.stockVisible ?? null)
  const agotado = stock?.tono === "agotado"

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-warm-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-border-strong hover:shadow-warm-lg">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {producto.imagenPrincipal ? (
          <img
            src={producto.imagenPrincipal}
            alt={producto.nombre}
            loading={prioridad ? "eager" : "lazy"}
            className={cn(
              "size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
              agotado && "opacity-60 saturate-50",
            )}
          />
        ) : (
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_25%,var(--accent)_0%,transparent_55%)]">
            <Package
              aria-hidden="true"
              className="size-10 text-accent-foreground/35 transition-transform duration-500 group-hover:scale-110"
            />
            <span className="sr-only">Producto sin imagen</span>
          </div>
        )}

        {/* brillo diagonal al pasar el cursor */}
        <span aria-hidden="true" className="sheen absolute inset-0" />

        {stock && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-warm-sm backdrop-blur-md",
              stock.tono === "hay" && "bg-teal text-teal-foreground",
              stock.tono === "poco" && "bg-accent text-accent-foreground",
              stock.tono === "agotado" &&
                "bg-card/90 text-muted-foreground ring-1 ring-border-strong",
            )}
          >
            {stock.texto}
          </span>
        )}

        {/* acción que emerge al pasar el cursor; en móvil siempre visible */}
        <Link
          to={`/producto/${encodeURIComponent(producto.slug)}`}
          className={cn(
            "absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-warm",
            "transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "motion-reduce:translate-y-0 motion-reduce:opacity-100",
          )}
        >
          <ShoppingCart aria-hidden="true" className="size-3.5" />
          Ver opciones
          <span className="sr-only"> — {producto.nombre}</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {producto.categoriaNombre && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent-strong">
            {producto.categoriaNombre}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.75rem] font-medium leading-snug transition-colors duration-200 group-hover:text-accent-strong">
          {producto.nombre}
        </h3>
        <p className="mt-auto pt-2 text-xl font-bold tabular-nums tracking-tight">
          {formatCurrency(producto.precio, producto.moneda)}
        </p>
      </div>
    </article>
  )
}
