import { Link } from "react-router-dom"

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Página no encontrada</h1>
      <p className="mt-3 text-muted-foreground">
        La dirección solicitada no existe o todavía no está disponible.
      </p>
      <Link
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        to="/"
      >
        Volver al inicio
      </Link>
    </section>
  )
}

