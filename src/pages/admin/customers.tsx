import { useState, type FormEvent } from "react"

import { Can } from "@/components/shared/Can"
import { RequestError } from "@/components/shared/RequestError"
import { useAdminAction, useAdminPage } from "@/hooks/useAdmin"
import {
  useCreateCustomerAddress,
  useCustomerAddresses,
} from "@/hooks/useCustomers"
import { adminService } from "@/services/admin"
import type { AdminCustomer, CreateCustomerRequest } from "@/types/admin"
import type { CreateCustomerAddressRequest } from "@/types/customer"

export default function AdminCustomersPage() {
  const customers = useAdminPage<AdminCustomer>(
    "clientes",
    adminService.listCustomers,
    100,
  )
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const addresses = useCustomerAddresses(selectedCustomerId)
  const createAddress = useCreateCustomerAddress(selectedCustomerId)
  const createCustomer = useAdminAction<CreateCustomerRequest>((payload) =>
    adminService.createCustomer(payload),
  )
  const [customerForm, setCustomerForm] = useState<CreateCustomerRequest>({
    codigo: "",
    tipoCliente: "persona",
    nombres: "",
    apellidos: "",
    razonSocial: "",
    email: "",
    telefono: "",
    metadata: {},
    activo: true,
  })
  const [addressForm, setAddressForm] =
    useState<CreateCustomerAddressRequest>({
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
    })

  const submitAddress = async (event: FormEvent) => {
    event.preventDefault()
    await createAddress.mutateAsync(addressForm)
    setAddressForm((current) => ({
      ...current,
      destinatario: "",
      telefono: "",
      direccionLinea1: "",
      direccionLinea2: "",
      ciudad: "",
      departamento: "",
      codigoPostal: "",
      referencia: "",
      principal: false,
    }))
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Clientes y direcciones</h2>
      {customers.isPending ? <p className="mt-4">Cargando...</p> : null}
      {customers.error ? (
        <div className="mt-4">
          <RequestError error={customers.error} />
        </div>
      ) : null}
      {createCustomer.error ? <div className="mt-4"><RequestError error={createCustomer.error} /></div> : null}
      {createAddress.error ? <div className="mt-4"><RequestError error={createAddress.error} /></div> : null}

      <Can permission="clientes:crear">
        <form className="mt-4 grid gap-3 rounded-md border p-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); createCustomer.mutate(customerForm) }}>
          <h3 className="font-semibold md:col-span-2">Crear cliente</h3>
          <input className="rounded-md border p-2" placeholder="Código" required value={customerForm.codigo} onChange={(event) => setCustomerForm((current) => ({ ...current, codigo: event.target.value }))} />
          <select className="rounded-md border p-2" value={customerForm.tipoCliente} onChange={(event) => setCustomerForm((current) => ({ ...current, tipoCliente: event.target.value as "persona" | "empresa" }))}><option value="persona">Persona</option><option value="empresa">Empresa</option></select>
          <input className="rounded-md border p-2" placeholder="Nombres" value={customerForm.nombres} onChange={(event) => setCustomerForm((current) => ({ ...current, nombres: event.target.value }))} />
          <input className="rounded-md border p-2" placeholder="Apellidos" value={customerForm.apellidos} onChange={(event) => setCustomerForm((current) => ({ ...current, apellidos: event.target.value }))} />
          <input className="rounded-md border p-2" placeholder="Razón social" value={customerForm.razonSocial} onChange={(event) => setCustomerForm((current) => ({ ...current, razonSocial: event.target.value }))} />
          <input className="rounded-md border p-2" placeholder="Correo" type="email" value={customerForm.email} onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))} />
          <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground md:col-span-2" type="submit">Crear cliente</button>
        </form>
      </Can>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ul className="divide-y rounded-md border">
          {(customers.data?.items ?? []).map((customer) => (
            <li className="p-3" key={customer.id}>
              <button
                className="w-full text-left"
                onClick={() => setSelectedCustomerId(customer.id)}
                type="button"
              >
                <span className="block font-medium">
                  {customer.razonSocial ||
                    [customer.nombres, customer.apellidos]
                      .filter(Boolean)
                      .join(" ")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {customer.codigo} · {customer.email ?? "sin correo"}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="rounded-md border p-4">
          <h3 className="font-semibold">Direcciones del cliente</h3>
          {!selectedCustomerId ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Selecciona un cliente para consultar sus direcciones.
            </p>
          ) : null}
          {addresses.isPending ? <p className="mt-3">Cargando...</p> : null}
          {addresses.error ? (
            <div className="mt-3">
              <RequestError error={addresses.error} />
            </div>
          ) : null}
          {addresses.data?.length ? (
            <ul className="mt-3 space-y-3 text-sm">
              {addresses.data.map((address) => (
                <li className="rounded-md border p-3" key={address.id}>
                  <p className="font-medium">{address.etiqueta}</p>
                  <p>
                    {address.direccionLinea1}, {address.ciudad}, {address.pais}
                  </p>
                  <p>{address.destinatario}</p>
                </li>
              ))}
            </ul>
          ) : selectedCustomerId && addresses.data ? (
            <p className="mt-3 text-sm">El cliente no tiene direcciones.</p>
          ) : null}
          {selectedCustomerId ? (
            <Can permission="clientes:actualizar">
              <form className="mt-4 grid gap-2" onSubmit={submitAddress}>
                <h4 className="font-medium">Agregar dirección</h4>
                <input className="rounded-md border p-2" placeholder="Etiqueta" required value={addressForm.etiqueta} onChange={(event) => setAddressForm((current) => ({ ...current, etiqueta: event.target.value }))} />
                <input className="rounded-md border p-2" placeholder="Destinatario" required value={addressForm.destinatario} onChange={(event) => setAddressForm((current) => ({ ...current, destinatario: event.target.value }))} />
                <input className="rounded-md border p-2" placeholder="Dirección" required value={addressForm.direccionLinea1} onChange={(event) => setAddressForm((current) => ({ ...current, direccionLinea1: event.target.value }))} />
                <input className="rounded-md border p-2" placeholder="Ciudad" required value={addressForm.ciudad} onChange={(event) => setAddressForm((current) => ({ ...current, ciudad: event.target.value }))} />
                <input className="rounded-md border p-2" placeholder="País" required value={addressForm.pais} onChange={(event) => setAddressForm((current) => ({ ...current, pais: event.target.value }))} />
                <button className="rounded-md border px-3 py-2" disabled={createAddress.isPending} type="submit">Guardar dirección</button>
              </form>
            </Can>
          ) : null}
        </div>
      </div>
    </section>
  )
}
