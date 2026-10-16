import type { CatalogProduct } from "@/types/catalog"
import type { Customer } from "@/types/customer"
import type { Invoice, Order, Payment, Shipment } from "@/types/order"

export type AdminProduct = CatalogProduct & {
  activo?: boolean
  publicado?: boolean
  fechaActualizacion?: string
}

export type AdminCustomer = Customer
export type AdminOrder = Order
export type AdminPayment = Payment
export type AdminInvoice = Invoice
export type AdminShipment = Shipment

export interface Discount {
  id: string
  codigo: string
  nombre?: string
  tipo: "porcentaje" | "monto" | string
  valor: number
  codigoCupon?: string | null
  minimoCompra?: number | null
  moneda?: string | null
  fechaInicio?: string | null
  fechaFin?: string | null
  activo: boolean
}

export interface Configuration {
  id: string
  organizacionId?: string | null
  alcance: string
  clave: string
  valor: unknown
  descripcion?: string | null
  activo: boolean
}

export interface AdminUser {
  id: string
  organizacionId?: string
  rolId: string
  rolCodigo?: string
  email: string
  nombres?: string | null
  apellidos?: string | null
  telefono?: string | null
  esSuperusuario: boolean
  activo: boolean
}

export interface Role {
  id: string
  organizacionId?: string | null
  nombre: string
  codigo: string
  descripcion?: string | null
  esSistema: boolean
  activo: boolean
}

export interface Permission {
  id: string
  codigo: string
  clave: string
  accion: string
  recurso: string
  descripcion?: string | null
  activo: boolean
}

export interface CreatePaymentRequest {
  pedidoId: string
  metodo: string
  referencia?: string
  observacion?: string
  estado: "pendiente"
}

export interface CreateCustomerRequest {
  codigo: string
  tipoCliente: "persona" | "empresa"
  nombres?: string
  apellidos?: string
  razonSocial?: string
  tipoDocumento?: string
  numeroDocumento?: string
  email?: string
  telefono?: string
  direccion?: string
  metadata: Record<string, unknown>
  activo: boolean
}

export interface CreateInvoiceRequest {
  codigo: string
  numeroFactura: string
  fiscalNombre: string
  fiscalTipoDocumento: string
  fiscalDocumento: string
}

export interface CreateDiscountRequest {
  codigo: string
  nombre: string
  tipo: "porcentaje" | "monto"
  valor: number
  codigoCupon?: string
  minimoCompra?: number
  moneda?: string
  fechaInicio?: string
  fechaFin?: string
  activo: boolean
}
