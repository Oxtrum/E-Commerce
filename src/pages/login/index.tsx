import { useState, type FormEvent } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "@/context/auth-provider"
import { useOrganization } from "@/context/organization-provider"
import { ApiError } from "@/lib/api"

interface LoginLocationState {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

function getReturnPath(state: LoginLocationState | null) {
  const from = state?.from
  if (!from?.pathname || from.pathname === "/login") return "/"
  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
}

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const { organization, clearOrganization } = useOrganization()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const returnPath = getReturnPath(
    location.state as LoginLocationState | null,
  )

  if (!organization) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/seleccionar-tienda"
      />
    )
  }

  if (isAuthenticated) return <Navigate replace to={returnPath} />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await login({
        codigoOrganizacion: organization.codigo,
        email,
        contrasena,
      })
      navigate(returnPath, { replace: true })
    } catch (loginError) {
      const message =
        loginError instanceof ApiError
          ? `${loginError.message}${loginError.requestId ? ` (Request ID: ${loginError.requestId})` : ""}`
          : "No fue posible iniciar sesión"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const changeOrganization = () => {
    clearOrganization()
    navigate("/seleccionar-tienda", {
      replace: true,
      state: { from: { pathname: "/login" } },
    })
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Ingresar a ECom-Core</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tienda seleccionada: {organization.nombre}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          Correo electrónico
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            className="mt-1 w-full rounded-md border bg-background p-2"
            onChange={(event) => setContrasena(event.target.value)}
            required
            type="password"
            value={contrasena}
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
        <button
          className="w-full text-sm underline"
          disabled={isSubmitting}
          onClick={changeOrganization}
          type="button"
        >
          Cambiar tienda
        </button>
      </form>
    </section>
  )
}
