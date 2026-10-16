import { useEffect, useState } from "react"
import {
  ArrowRight,
  CreditCard,
  PackageCheck,
  PackageSearch,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { useCatalog } from "@/hooks/useCatalog"
import { useOrganization } from "@/context/organization-provider"
import { ProductCard } from "@/components/store/ProductCard"
import { HeroArt } from "@/components/store/HeroArt"
import { Reveal } from "@/components/store/Reveal"

interface Beneficio {
  icon: LucideIcon
  titulo: string
  texto: string
}

interface Paso {
  icon: LucideIcon
  titulo: string
  texto: string
}

interface Pregunta {
  pregunta: string
  respuesta: string
}

const BENEFICIOS: readonly Beneficio[] = [
  {
    icon: PackageCheck,
    titulo: "Stock real",
    texto: "Solo publicamos lo que hay en depósito",
  },
  {
    icon: CreditCard,
    titulo: "Pago seguro",
    texto: "Elige el método que prefieras",
  },
  {
    icon: Truck,
    titulo: "Envío con seguimiento",
    texto: "Sigue tu pedido con su código",
  },
  {
    icon: Receipt,
    titulo: "Comprobante",
    texto: "Recibes el detalle de tu compra",
  },
]

const PASOS: readonly Paso[] = [
  {
    icon: Search,
    titulo: "Busca el producto que necesitas",
    texto: "Filtra por categoría o escribe lo que buscas.",
  },
  {
    icon: ShoppingCart,
    titulo: "Agrégalo al carrito",
    texto: "Elige la talla, el color o la presentación que quieres.",
  },
  {
    icon: CreditCard,
    titulo: "Paga tu pedido",
    texto: "Guardamos tus unidades mientras completas el pago.",
  },
  {
    icon: Truck,
    titulo: "Recibe tu compra",
    texto: "Te damos el código para seguir el envío hasta tu puerta.",
  },
]

const CINTA: readonly string[] = [
  "Stock verificado",
  "Reserva inmediata",
  "Envío con seguimiento",
  "Comprobante en cada compra",
  "Pago seguro",
  "Cupones activos",
]

const PREGUNTAS: readonly Pregunta[] = [
  {
    pregunta: "¿Puede agotarse el producto mientras pago?",
    respuesta:
      "No. Tus unidades quedan guardadas desde que confirmas el pedido, no desde que termina el pago.",
  },
  {
    pregunta: "¿La disponibilidad que veo es real?",
    respuesta:
      "Sí. El stock se calcula con cada entrada y salida del depósito. Nadie lo edita a mano.",
  },
  {
    pregunta: "¿Qué pasa si cancelo o me rechazan el pago?",
    respuesta:
      "Las unidades vuelven al catálogo. Si ya habías pagado, se gestiona la devolución.",
  },
  {
    pregunta: "¿Recibo factura o comprobante?",
    respuesta:
      "Sí. Con el detalle de los productos que llevaste y los importes aplicados.",
  },
  {
    pregunta: "¿Puedo usar cupones?",
    respuesta:
      "Sí, si la tienda tiene promociones activas. Se aplican en el carrito antes de pagar.",
  },
]

export default function HomePage() {
  const { organization } = useOrganization()
  const [busqueda, setBusqueda] = useState("")
  const [consulta, setConsulta] = useState("")

  useEffect(() => {
    const timeout = setTimeout(() => setConsulta(busqueda.trim()), 300)
    return () => clearTimeout(timeout)
  }, [busqueda])

  const { data, isLoading } = useCatalog({
    ...(organization?.slug
      ? { organizacionSlug: organization.slug }
      : { organizacionCodigo: organization?.codigo }),
    nombre: consulta || undefined,
    limit: 8,
  })
  const productos = data?.items ?? []
  const hayProductos = productos.length > 0

  const categorias = Array.from(
    new Map(
      productos
        .filter((producto) => producto.categoriaNombre)
        .map((producto) => [producto.categoriaSlug, producto.categoriaNombre]),
    ).values(),
  )

  return (
    <div>
      {/* ---------------------------------------------------------- Hero */}
      <section className="grain relative overflow-hidden border-b border-border bg-gradient-to-br from-secondary via-background to-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 size-[26rem] rounded-full bg-accent/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 bottom-0 size-[30rem] rounded-full bg-teal/15 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-strong/50 bg-card/70 px-3.5 py-1.5 text-xs font-semibold shadow-warm-sm backdrop-blur duration-700 animate-in fade-in slide-in-from-bottom-3 fill-mode-both">
              <Sparkles aria-hidden="true" className="size-3.5 text-accent-strong" />
              Cada unidad publicada existe en depósito
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-balance delay-100 duration-700 animate-in fade-in slide-in-from-bottom-3 fill-mode-both sm:text-6xl lg:text-7xl">
              Encuentra lo que{" "}
              <span className="text-gradient-warm">necesitas</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground delay-200 duration-700 animate-in fade-in slide-in-from-bottom-3 fill-mode-both">
              Compra en línea y recibe tu pedido en casa.
            </p>

            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="mt-9 flex max-w-lg items-center gap-2 rounded-2xl border border-border-strong/60 bg-card p-2 shadow-warm-lg delay-300 duration-700 animate-in fade-in slide-in-from-bottom-3 fill-mode-both focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15"
            >
              <label htmlFor="buscar" className="sr-only">
                Buscar productos
              </label>
              <Search
                aria-hidden="true"
                className="ml-2 size-5 shrink-0 text-muted-foreground"
              />
              <input
                id="buscar"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="¿Qué estás buscando?"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-muted-foreground"
              />
              <a
                href="#productos"
                className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition-all duration-200 hover:scale-[1.03] hover:shadow-glow active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Buscar
              </a>
            </form>
          </div>

          <div className="delay-200 duration-1000 animate-in fade-in zoom-in-95 fill-mode-both">
            <HeroArt className="mx-auto w-full max-w-md" />
          </div>
        </div>

        {/* cinta de señales */}
        <div className="relative flex overflow-hidden border-t border-border bg-primary py-3 text-primary-foreground">
          <div className="flex shrink-0 animate-marquee gap-10 pr-10">
            {[...CINTA, ...CINTA].map((texto, index) => (
              <span
                key={`${texto}-${index}`}
                className="flex shrink-0 items-center gap-2.5 text-sm font-medium"
              >
                <ShieldCheck aria-hidden="true" className="size-4 opacity-70" />
                {texto}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Beneficios */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
          {BENEFICIOS.map((beneficio, index) => (
            <Reveal key={beneficio.titulo} delay={index * 90}>
              <div className="group flex flex-col items-center gap-3 text-center">
                <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-accent-strong shadow-warm-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-glow">
                  <beneficio.icon aria-hidden="true" className="size-7" />
                </span>
                <div>
                  <p className="font-semibold">{beneficio.titulo}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {beneficio.texto}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- Categorías */}
      {categorias.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {categorias.map((categoria) => (
                <span
                  key={categoria}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-warm-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-warm"
                >
                  <Tag aria-hidden="true" className="size-4 text-accent-strong" />
                  {categoria}
                </span>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------------------------------------------------- Productos */}
      <section
        id="productos"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8"
      >
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {consulta
                ? `Resultados para "${consulta}"`
                : "Productos disponibles"}
            </h2>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block"
            />
          </div>
        </Reveal>

        {isLoading && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="aspect-square animate-pulse bg-secondary" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
                  <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                  <div className="h-5 w-1/2 animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && hayProductos && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {productos.map((producto, index) => (
              <Reveal key={producto.id} delay={Math.min(index, 4) * 70}>
                <ProductCard producto={producto} prioridad={index < 4} />
              </Reveal>
            ))}
          </div>
        )}

        {!isLoading && !hayProductos && (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border-strong/60 bg-card px-4 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-accent-strong">
              <PackageSearch aria-hidden="true" className="size-7" />
            </span>
            <p className="text-lg font-semibold">
              {consulta
                ? "No encontramos ese producto"
                : "Todavía no hay productos publicados"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {consulta
                ? "Prueba con otra palabra o revisa la ortografía."
                : "Vuelve pronto. Los productos aparecerán aquí en cuanto se publiquen."}
            </p>
            {consulta && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="mt-1 rounded-xl border border-border-strong/60 bg-card px-4 py-2 text-sm font-medium shadow-warm-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        )}
      </section>

      {/* -------------------------------------------------- Cómo comprar */}
      <section className="grain relative overflow-hidden border-y border-border bg-secondary/60 py-16 sm:py-20">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              ¿Cómo comprar?
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((paso, index) => (
              <Reveal key={paso.titulo} delay={index * 110}>
                <li className="group relative text-center">
                  {/* conector entre pasos */}
                  {index < PASOS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[calc(50%+2.5rem)] top-8 hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-border-strong/60 to-transparent lg:block"
                    />
                  )}
                  <div className="relative mx-auto w-fit">
                    <span className="grid size-16 place-items-center rounded-2xl bg-card text-accent-strong shadow-warm ring-1 ring-border transition-all duration-300 group-hover:-translate-y-1.5 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-glow">
                      <paso.icon aria-hidden="true" className="size-7" />
                    </span>
                    <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground shadow-warm-sm">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold leading-snug">
                    {paso.titulo}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {paso.texto}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------------- FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Preguntas frecuentes
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {PREGUNTAS.map((item, index) => (
            <Reveal key={item.pregunta} delay={index * 60}>
              <details className="group rounded-2xl border border-border bg-card px-5 shadow-warm-sm transition-all duration-200 open:shadow-warm hover:border-border-strong">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {item.pregunta}
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-lg leading-none text-accent-strong transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-4 pr-10 leading-relaxed text-muted-foreground">
                  {item.respuesta}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-warm-lg sm:px-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-teal/20 blur-3xl"
            />
            <h2 className="relative text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Empieza por lo que estabas buscando
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/75">
              Todo lo que ves aquí está disponible ahora.
            </p>
            <a
              href="#productos"
              className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-warm transition-all duration-200 hover:scale-[1.03] hover:shadow-glow active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver productos
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
