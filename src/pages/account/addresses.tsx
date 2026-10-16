import { useState, type FormEvent } from "react"

import { CustomerRequired } from "@/components/account/CustomerRequired"
import { RequestError } from "@/components/shared/RequestError"
import { useCustomerSelection } from "@/context/customer-provider"
import {
  useCreateCustomerAddress,
  useCustomerAddresses,
} from "@/hooks/useCustomers"
import { serializeAddress } from "@/services/customers"
import type { CreateCustomerAddressRequest } from "@/types/customer"

const emptyAddress: CreateCustomerAddressRequest = {
  etiqueta: "Casa",
  destinatario: "",
  telefono: "",
  direccionLinea1: "",
  direccionLinea2: "",
  ciudad: "",
  departamento: "",
  pais: "BO",
  codigoPostal: "",
  referencia: "",
  principal: false,
}

export default function AccountAddressesPage() {
  const { customerId } = useCustomerSelection()
  const addresses = useCustomerAddresses(customerId)
  const createAddress = useCreateCustomerAddress(customerId)
  const [form, setForm] = useState<CreateCustomerAddressRequest>(emptyAddress)

  if (!customerId) return <CustomerRequired />

  const setField = <K extends keyof CreateCustomerAddressRequest>(
    field: K,
    value: CreateCustomerAddressRequest[K],
  ) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await createAddress.mutateAsync(form)
      setForm(emptyAddress)
    } catch {
      // La mutation expone el error sin perder los datos capturados.
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Direcciones</h2>
      {addresses.isPending ? <p className="mt-4">Cargando direcciones...</p> : null}
      {addresses.error ? <RequestError error={addresses.error} /> : null}
      {addresses.data?.length ? (
        <ul className="mt-4 divide-y rounded-md border">
          {addresses.data.map((address) => (
            <li className="p-4" key={address.id}>
              <p className="font-medium">
                {address.etiqueta} {address.principal ? "(principal)" : ""}
              </p>
              <p className="mt-1 text-sm">{serializeAddress(address)}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <h3 className="mt-8 font-semibold">Agregar dirección</h3>
      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={submit}>
        {(
          [
            ["etiqueta", "Etiqueta"],
            ["destinatario", "Destinatario"],
            ["telefono", "Teléfono"],
            ["direccionLinea1", "Dirección línea 1"],
            ["direccionLinea2", "Dirección línea 2"],
            ["ciudad", "Ciudad"],
            ["departamento", "Departamento"],
            ["pais", "País"],
            ["codigoPostal", "Código postal"],
            ["referencia", "Referencia"],
          ] as const
        ).map(([field, label]) => (
          <label className="text-sm" key={field}>
            {label}
            <input
              className="mt-1 w-full rounded-md border bg-background p-2"
              onChange={(event) => setField(field, event.target.value)}
              required={
                field === "etiqueta" ||
                field === "destinatario" ||
                field === "direccionLinea1" ||
                field === "ciudad" ||
                field === "pais"
              }
              value={String(form[field] ?? "")}
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={form.principal}
            onChange={(event) => setField("principal", event.target.checked)}
            type="checkbox"
          />
          Dirección principal
        </label>
        {createAddress.error ? (
          <div className="md:col-span-2">
            <RequestError error={createAddress.error} />
          </div>
        ) : null}
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50 md:col-span-2"
          disabled={createAddress.isPending}
          type="submit"
        >
          {createAddress.isPending ? "Guardando..." : "Guardar dirección"}
        </button>
      </form>
    </section>
  )
}
