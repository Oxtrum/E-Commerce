import { Link } from "react-router-dom"

export function CustomerRequired() {
  return (
    <div className="rounded-md border p-4">
      <p>Selecciona primero el cliente asociado a la cuenta.</p>
      <Link className="mt-2 inline-block underline" to="/mi-cuenta">
        Seleccionar cliente
      </Link>
    </div>
  )
}
