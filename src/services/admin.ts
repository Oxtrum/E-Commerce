import { api, type QueryParams } from "@/lib/api"
import {
  normalizeCollection,
  normalizePage,
  type CollectionResponse,
} from "@/lib/pagination"
import type {
  AdminCustomer,
  AdminInvoice,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminShipment,
  AdminUser,
  Configuration,
  CreateCustomerRequest,
  CreateDiscountRequest,
  CreateInvoiceRequest,
  CreatePaymentRequest,
  Discount,
  Permission,
  Role,
} from "@/types/admin"
import type { PaginatedData } from "@/types/common"
import type { Organization } from "@/types/organization"

interface ListOptions {
  limit?: number
  offset?: number
  signal?: AbortSignal
  params?: QueryParams
}

async function listPage<T>(
  path: string,
  { limit = 50, offset = 0, signal, params }: ListOptions = {},
): Promise<PaginatedData<T>> {
  const response = await api.get<CollectionResponse<T>>(path, {
    params: { ...params, limit, offset },
    signal,
  })
  return normalizePage(response, limit, offset)
}

async function listCollection<T>(path: string, signal?: AbortSignal) {
  const response = await api.get<CollectionResponse<T>>(path, {
    params: { limit: 200, offset: 0 },
    signal,
  })
  return normalizeCollection(response)
}

export const adminService = {
  listProducts: (options?: ListOptions) =>
    listPage<AdminProduct>("/productos", options),
  listCustomers: (options?: ListOptions) =>
    listPage<AdminCustomer>("/clientes", options),
  listOrders: (options?: ListOptions) =>
    listPage<AdminOrder>("/pedidos", options),
  listPayments: (options?: ListOptions) =>
    listPage<AdminPayment>("/pagos", options),
  listInvoices: (options?: ListOptions) =>
    listPage<AdminInvoice>("/facturas", options),
  listShipments: (options?: ListOptions) =>
    listPage<AdminShipment>("/envios", options),
  listDiscounts: (options?: ListOptions) =>
    listPage<Discount>("/descuentos", options),
  listOrganizations: (signal?: AbortSignal) =>
    listCollection<Organization>("/organizaciones", signal),
  listConfigurations: (signal?: AbortSignal) =>
    listCollection<Configuration>("/configuraciones", signal),
  listUsers: (signal?: AbortSignal) =>
    listCollection<AdminUser>("/usuarios", signal),
  listRoles: (signal?: AbortSignal) =>
    listCollection<Role>("/roles", signal),
  listPermissions: (signal?: AbortSignal) =>
    listCollection<Permission>("/permisos", signal),
  listRolePermissions: async (roleId: string, signal?: AbortSignal) => {
    const response = await api.get<CollectionResponse<Permission>>(
      `/roles/${roleId}/permisos`,
      { signal },
    )
    return normalizeCollection(response)
  },

  updateOrderStatus: (orderId: string, estado: string) =>
    api.patch<AdminOrder>(`/pedidos/${orderId}`, { estado }),
  createCustomer: (payload: CreateCustomerRequest) =>
    api.post<AdminCustomer>("/clientes", payload),
  createPayment: (
    payload: CreatePaymentRequest,
    idempotencyKey: string,
  ) => api.post<AdminPayment>("/pagos", payload, { idempotencyKey }),
  confirmPayment: (paymentId: string, idempotencyKey: string) =>
    api.patch<AdminPayment>(
      `/pagos/${paymentId}/confirmar`,
      {},
      { idempotencyKey },
    ),
  createInvoiceFromOrder: (
    orderId: string,
    payload: CreateInvoiceRequest,
  ) => api.post<AdminInvoice>(`/facturas/desde-pedido/${orderId}`, payload),
  issueInvoice: (invoiceId: string) =>
    api.post<AdminInvoice>(`/facturas/${invoiceId}/emitir`, {}),
  cancelInvoice: (invoiceId: string, motivo: string) =>
    api.post<AdminInvoice>(`/facturas/${invoiceId}/anular`, { motivo }),
  updateShipmentStatus: (shipmentId: string, estado: string) =>
    api.patch<AdminShipment>(`/envios/${shipmentId}`, { estado }),
  createDiscount: (payload: CreateDiscountRequest) =>
    api.post<Discount>("/descuentos", payload),
  deactivateDiscount: (discountId: string) =>
    api.del<Discount>(`/descuentos/${discountId}`),
  restoreDiscount: (discountId: string) =>
    api.patch<Discount>(`/descuentos/${discountId}/restaurar`, {}),

  updateOrganization: (organizationId: string, payload: Partial<Organization>) =>
    api.patch<Organization>(`/organizaciones/${organizationId}`, payload),
  updateConfiguration: (configurationId: string, valor: unknown) =>
    api.patch<Configuration>(`/configuraciones/${configurationId}`, { valor }),
  updateUserRole: (userId: string, rolId: string) =>
    api.patch<AdminUser>(`/usuarios/${userId}/rol`, { rolId }),
  resetUserPassword: (userId: string, contrasena: string) =>
    api.patch<AdminUser>(`/usuarios/${userId}/contrasena`, { contrasena }),
  deactivateUser: (userId: string) =>
    api.patch<AdminUser>(`/usuarios/${userId}/desactivar`, {}),
  restoreUser: (userId: string) =>
    api.patch<AdminUser>(`/usuarios/${userId}/restaurar`, {}),
  async assignRolePermissions(roleId: string, permissionIds: string[]) {
    const current = await adminService.listRolePermissions(roleId)
    const currentIds = new Set(current.map((permission) => permission.id))
    const desiredIds = new Set(permissionIds)
    // La API aplica cada permiso por separado; un reintento recalcula el delta.
    for (const permisoId of desiredIds) {
      if (!currentIds.has(permisoId)) {
        await api.post(`/roles/${roleId}/permisos`, { permisoId })
      }
    }
    for (const permisoId of currentIds) {
      if (!desiredIds.has(permisoId)) {
        await api.del(`/roles/${roleId}/permisos/${permisoId}`)
      }
    }
  },
}
