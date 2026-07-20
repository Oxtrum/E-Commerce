import { ArrowRight, Blocks, Database, ShoppingCart } from "lucide-react"

const foundations = [
  {
    icon: Blocks,
    title: "Arquitectura modular",
    description: "Capas iniciales para types, services, hooks, pages y components.",
  },
  {
    icon: Database,
    title: "API centralizada",
    description: "Cliente HTTP preparado para consumir exclusivamente e-commerceApi.",
  },
  {
    icon: ShoppingCart,
    title: "Dominio comercial",
    description: "Base para catálogo, carrito, checkout, pedidos y backoffice.",
  },
]

export default function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-3xl">
        <p className="mb-5 inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          React + TypeScript + Vite
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          La base de E-Commerce Front está lista.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          El proyecto comparte el stack y las convenciones de Inventarios-Front,
          con una frontera clara hacia e-commerceApi.
        </p>
        <a
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          href="https://github.com/Oxtrum/E-Commerce"
          rel="noreferrer"
          target="_blank"
        >
          Ver repositorio
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {foundations.map(({ icon: Icon, title, description }) => (
          <article className="rounded-2xl border bg-card p-6 shadow-sm" key={title}>
            <span className="grid size-10 place-items-center rounded-xl bg-secondary">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-5 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

