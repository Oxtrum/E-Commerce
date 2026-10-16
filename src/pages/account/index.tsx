import { useState, type FormEvent } from "react"

import { RequestError } from "@/components/shared/RequestError"
import { useCustomerSelection } from "@/context/customer-provider"
import { useCustomer } from "@/hooks/useCustomers"

export default function AccountHomePage() {
  const { customerId, selectCustomer, clearCustomer } = useCustomerSelection()
  const [customerIdDraft, setCustomerIdDraft] = useState(customerId)
  const customer = useCustomer(customerId)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    selectCustomer(customerIdDraft)
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Perfil de cliente</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        La API todavía no relaciona `/auth/me` con un `clienteId`. Para este
        esqueleto se selecciona explícitamente el cliente y la API conserva la
        autorización real.
      </p>

      <form className="mt-5 flex max-w-2xl gap-2" onSubmit={submit}>
        <input
          className="min-w-0 flex-1 rounded-md border bg-background p-2"
          onChange={(event) => setCustomerIdDraft(event.target.value)}
          placeholder="ID del cliente"
          required
          value={customerIdDraft}
        />
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          type="submit"
        >
          Consultar
        </button>
        {customerId ? (
          <button
            className="rounded-md border px-4 py-2"
            onClick={() => {
              clearCustomer()
              setCustomerIdDraft("")
            }}
            type="button"
          >
            Limpiar
          </button>
        ) : null}
      </form>

      {customer.isPending && customerId ? <p className="mt-5">Cargando...</p> : null}
      {customer.error ? (
        <div className="mt-5">
          <RequestError error={customer.error} />
        </div>
      ) : null}
      {customer.data ? (
        <dl className="mt-5 grid max-w-2xl grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt>Código</dt>
          <dd>{customer.data.codigo}</dd>
          <dt>Nombre</dt>
          <dd>
            {customer.data.razonSocial ??
              [customer.data.nombres, customer.data.apellidos]
                .filter(Boolean)
                .join(" ")}
          </dd>
          <dt>Documento</dt>
          <dd>
            {[customer.data.tipoDocumento, customer.data.numeroDocumento]
              .filter(Boolean)
              .join(" ") || "No informado"}
          </dd>
          <dt>Correo</dt>
          <dd>{customer.data.email ?? "No informado"}</dd>
          <dt>Teléfono</dt>
          <dd>{customer.data.telefono ?? "No informado"}</dd>
          <dt>Dirección</dt>
          <dd>{customer.data.direccion ?? "No informada"}</dd>
        </dl>
      ) : null}
    </section>
  )
}
