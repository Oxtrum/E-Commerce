import { Link } from "react-router-dom"

export default function ForbiddenPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-sm font-semibold">403</p>
      <h1 className="mt-2 text-2xl font-semibold">Acceso insuficiente</h1>
      <p className="mt-3 text-muted-foreground">
        Tu sesión no cuenta con el permiso necesario para esta sección.
      </p>
      <Link className="mt-6 inline-block underline" to="/">
        Volver a la tienda
      </Link>
    </section>
  )
}
