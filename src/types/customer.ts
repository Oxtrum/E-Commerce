export interface Customer {
  id: string
  organizacionId: string
  codigo: string
  tipoCliente: string
  nombres?: string | null
  apellidos?: string | null
  razonSocial?: string | null
  tipoDocumento?: string | null
  numeroDocumento?: string | null
  email?: string | null
  telefono?: string | null
  direccion?: string | null
  metadata: Record<string, unknown>
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CustomerAddress {
  id: string
  clienteId?: string
  etiqueta: string
  destinatario: string
  telefono?: string | null
  direccionLinea1: string
  direccionLinea2?: string | null
  ciudad: string
  departamento?: string | null
  pais: string
  codigoPostal?: string | null
  referencia?: string | null
  principal: boolean
  fechaCreacion?: string
  fechaActualizacion?: string
}

export type CreateCustomerAddressRequest = Omit<
  CustomerAddress,
  "id" | "clienteId" | "fechaCreacion" | "fechaActualizacion"
>
