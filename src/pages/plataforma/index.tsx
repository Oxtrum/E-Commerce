import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const DOLORES = [
  "Vendiste algo que ya no estaba y tuviste que llamar al cliente para cancelar.",
  "Cargas el mismo producto dos veces: una en la tienda y otra en el depósito.",
  "Falta mercadería y nadie sabe si se vendió, se rompió o se la llevaron.",
]

const PASOS = [
  {
    titulo: "Cargas tu stock una vez",
    texto:
      "Productos, variantes, precios y depósitos viven en un solo lugar. No hay una segunda planilla que mantener.",
  },
  {
    titulo: "Publicas lo que quieres vender",
    texto:
      "Eliges qué productos salen a la tienda y con qué precio de venta. Lo que no publicas queda solo para uso interno.",
  },
  {
    titulo: "El stock se descuenta solo",
    texto:
      "Cuando alguien compra, esas unidades quedan apartadas. Al confirmarse el pago se descuentan del depósito. Sin que nadie toque nada.",
  },
]

const INCLUYE = [
  {
    titulo: "Varias sucursales o depósitos",
    texto:
      "Stock separado por local, con transferencias entre ellos y permisos por sucursal.",
  },
  {
    titulo: "Historial de todo lo que se movió",
    texto:
      "Cada entrada y salida queda registrada con fecha, motivo y responsable. Nada se borra: una anulación genera su movimiento inverso.",
  },
  {
    titulo: "Compras y proveedores",
    texto:
      "Registras la reposición y el stock sube solo. Si anulas la compra, vuelve a bajar.",
  },
  {
    titulo: "Conteos físicos",
    texto:
      "Comparas lo que dice el sistema contra lo que hay en el estante y ajustas la diferencia dejando constancia.",
  },
  {
    titulo: "Pedidos, pagos y comprobantes",
    texto:
      "El lado comercial completo, con el detalle de cada venta guardado tal como estaba el día que se hizo.",
  },
  {
    titulo: "Reportes de lo que importa",
    texto:
      "Qué se está por acabar, cuánto vale tu inventario y el movimiento de cada producto en el tiempo.",
  },
]

export default function PlataformaPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-primary text-primary-foreground grain">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-teal/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <p className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold tracking-wide text-accent">
            StockCore
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Controla tu inventario y vende en línea
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
            Cargas tu stock una vez y tu tienda muestra lo que realmente tienes.
          </p>
          <Link
            to="/"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-warm transition-all duration-200 hover:scale-[1.03] hover:shadow-glow active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Ver una tienda funcionando
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Problemas frecuentes
        </h2>
        <ul className="mt-6 space-y-4">
          {DOLORES.map((dolor) => (
            <li
              key={dolor}
              className="rounded-xl border-l-[3px] border-destructive/60 bg-destructive/5 py-3 pl-4 pr-3 text-muted-foreground"
            >
              {dolor}
            </li>
          ))}
        </ul>
        <p className="mt-8 leading-relaxed">
          Todos vienen de lo mismo: el número que ve el cliente y el que hay en
          el estante salen de dos lados distintos. StockCore usa uno solo, y lo
          calcula sumando cada movimiento registrado.
        </p>
      </section>

      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cómo funciona
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {PASOS.map((paso, index) => (
              <li
                key={paso.titulo}
                className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-accent font-mono text-sm font-bold text-accent-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {paso.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Qué incluye
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {INCLUYE.map((item) => (
            <div
              key={item.titulo}
              className="rounded-2xl border border-border bg-secondary/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-warm"
            >
              <h3 className="font-semibold">{item.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Ver la tienda
          </h2>
          <p className="mt-4 text-muted-foreground">
            La tienda de demostración usa el mismo inventario que usarías tú.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-warm transition-all duration-200 hover:scale-[1.03] hover:shadow-glow active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Ir a la tienda
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
