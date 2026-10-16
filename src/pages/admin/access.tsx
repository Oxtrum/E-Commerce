import { useState, type FormEvent } from "react"

import { Can } from "@/components/shared/Can"
import { RequestError } from "@/components/shared/RequestError"
import {
  useAdminAction,
  useAdminCollection,
  useRolePermissions,
} from "@/hooks/useAdmin"
import { adminService } from "@/services/admin"
import type {
  AdminUser,
  Configuration,
  Permission,
  Role,
} from "@/types/admin"
import type { Organization } from "@/types/organization"

export default function AdminAccessPage() {
  const organizations = useAdminCollection<Organization>(
    "organizaciones",
    adminService.listOrganizations,
  )
  const configurations = useAdminCollection<Configuration>(
    "configuraciones",
    adminService.listConfigurations,
  )
  const users = useAdminCollection<AdminUser>(
    "usuarios",
    adminService.listUsers,
  )
  const roles = useAdminCollection<Role>("roles", adminService.listRoles)
  const permissions = useAdminCollection<Permission>(
    "permisos",
    adminService.listPermissions,
  )

  const [organizationForm, setOrganizationForm] = useState({
    id: "",
    nombre: "",
    slug: "",
  })
  const [configurationForm, setConfigurationForm] = useState({
    id: "",
    valor: "",
  })
  const [configurationError, setConfigurationError] = useState("")
  const [userForm, setUserForm] = useState({
    id: "",
    rolId: "",
    contrasena: "",
  })
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [permissionDrafts, setPermissionDrafts] = useState<
    Record<string, string[]>
  >({})
  const rolePermissions = useRolePermissions(selectedRoleId)

  const updateOrganization = useAdminAction<typeof organizationForm>(
    ({ id, nombre, slug }) =>
      adminService.updateOrganization(id, { nombre, slug }),
  )
  const updateConfiguration = useAdminAction<{
    id: string
    valor: unknown
  }>(({ id, valor }) => adminService.updateConfiguration(id, valor))
  const updateUserRole = useAdminAction<{ id: string; rolId: string }>(
    ({ id, rolId }) => adminService.updateUserRole(id, rolId),
  )
  const resetUserPassword = useAdminAction<{ id: string; contrasena: string }>(
    ({ id, contrasena }) => adminService.resetUserPassword(id, contrasena),
  )
  const toggleUser = useAdminAction<{ id: string; restore: boolean }>(
    ({ id, restore }) =>
      restore
        ? adminService.restoreUser(id)
        : adminService.deactivateUser(id),
  )
  const assignPermissions = useAdminAction<{
    roleId: string
    permissionIds: string[]
  }>(({ roleId, permissionIds }) =>
    adminService.assignRolePermissions(roleId, permissionIds),
  )

  const submitConfiguration = (event: FormEvent) => {
    event.preventDefault()
    setConfigurationError("")
    try {
      updateConfiguration.mutate({
        id: configurationForm.id,
        valor: JSON.parse(configurationForm.valor),
      })
    } catch {
      setConfigurationError("El valor debe ser JSON válido.")
    }
  }

  const selectedPermissionIds =
    permissionDrafts[selectedRoleId] ??
    (rolePermissions.data ?? []).map((permission) => permission.id)

  const togglePermission = (permissionId: string) => {
    if (!selectedRoleId) return
    const current = selectedPermissionIds
    setPermissionDrafts((drafts) => ({
      ...drafts,
      [selectedRoleId]: current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    }))
  }

  const errors = [
    organizations.error,
    configurations.error,
    users.error,
    roles.error,
    permissions.error,
    rolePermissions.error,
    updateOrganization.error,
    updateConfiguration.error,
    updateUserRole.error,
    resetUserPassword.error,
    toggleUser.error,
    assignPermissions.error,
  ].filter(Boolean)

  return (
    <section className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold">Acceso y configuración</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Administración del tenant, usuarios, roles y permisos informados por
          la API.
        </p>
      </div>

      {errors[0] ? <RequestError error={errors[0]} /> : null}
      {assignPermissions.isError ? <p role="alert" className="text-sm text-destructive">No se completaron todos los cambios de permisos. Puede haber cambios aplicados; revisa el estado actualizado antes de reintentar.</p> : null}

      <Can permission="organizaciones:leer">
        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold">Organizaciones</h3>
            <ul className="mt-3 divide-y rounded-md border text-sm">
              {(organizations.data ?? []).map((organization) => (
                <li className="p-3" key={organization.id ?? organization.codigo}>
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      setOrganizationForm({
                        id: organization.id ?? "",
                        nombre: organization.nombre,
                        slug: organization.slug ?? "",
                      })
                    }
                    type="button"
                  >
                    <span className="font-medium">{organization.nombre}</span>
                    <span className="ml-2 text-muted-foreground">
                      {organization.codigo} · {organization.activo ? "activa" : "inactiva"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Can permission="organizaciones:actualizar">
            <form
              className="grid gap-3 rounded-md border p-4"
              onSubmit={(event) => {
                event.preventDefault()
                updateOrganization.mutate(organizationForm)
              }}
            >
              <h3 className="font-semibold">Actualizar organización</h3>
              <input className="rounded-md border p-2" placeholder="ID" readOnly required value={organizationForm.id} />
              <input className="rounded-md border p-2" placeholder="Nombre" required value={organizationForm.nombre} onChange={(event) => setOrganizationForm((current) => ({ ...current, nombre: event.target.value }))} />
              <input className="rounded-md border p-2" placeholder="Slug" required value={organizationForm.slug} onChange={(event) => setOrganizationForm((current) => ({ ...current, slug: event.target.value }))} />
              <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" disabled={!organizationForm.id} type="submit">Guardar</button>
            </form>
          </Can>
        </section>
      </Can>

      <Can permission="configuraciones:leer">
        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold">Configuraciones</h3>
            <ul className="mt-3 max-h-96 divide-y overflow-auto rounded-md border text-sm">
              {(configurations.data ?? []).map((configuration) => (
                <li className="p-3" key={configuration.id}>
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      setConfigurationForm({
                        id: configuration.id,
                        valor: JSON.stringify(configuration.valor, null, 2),
                      })
                    }
                    type="button"
                  >
                    <span className="block font-medium">{configuration.clave}</span>
                    <span className="text-muted-foreground">{configuration.alcance}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Can permission="configuraciones:actualizar">
            <form className="grid gap-3 rounded-md border p-4" onSubmit={submitConfiguration}>
              <h3 className="font-semibold">Editar valor JSON</h3>
              <input className="rounded-md border p-2" placeholder="ID" readOnly required value={configurationForm.id} />
              <textarea className="min-h-48 rounded-md border p-2 font-mono text-sm" required value={configurationForm.valor} onChange={(event) => setConfigurationForm((current) => ({ ...current, valor: event.target.value }))} />
              {configurationError ? <p className="text-sm text-destructive">{configurationError}</p> : null}
              <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" disabled={!configurationForm.id} type="submit">Guardar configuración</button>
            </form>
          </Can>
        </section>
      </Can>

      <Can permission="usuarios:leer">
        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold">Usuarios</h3>
            <ul className="mt-3 divide-y rounded-md border text-sm">
              {(users.data ?? []).map((user) => (
                <li className="flex items-center justify-between gap-3 p-3" key={user.id}>
                  <button className="text-left" onClick={() => setUserForm({ id: user.id, rolId: user.rolId, contrasena: "" })} type="button">
                    <span className="block font-medium">{user.email}</span>
                    <span>{user.rolCodigo} · {user.activo ? "activo" : "inactivo"}</span>
                  </button>
                  <Can permission={user.activo ? "usuarios:desactivar" : "usuarios:restaurar"}>
                    <button className="underline" onClick={() => toggleUser.mutate({ id: user.id, restore: !user.activo })} type="button">{user.activo ? "Desactivar" : "Restaurar"}</button>
                  </Can>
                </li>
              ))}
            </ul>
          </div>
          <Can permission="usuarios:actualizar">
            <form className="grid gap-3 rounded-md border p-4" onSubmit={(event) => { event.preventDefault(); updateUserRole.mutate({ id: userForm.id, rolId: userForm.rolId }) }}>
              <h3 className="font-semibold">Rol y contraseña</h3>
              <input className="rounded-md border p-2" placeholder="ID" readOnly required value={userForm.id} />
              <select className="rounded-md border p-2" required value={userForm.rolId} onChange={(event) => setUserForm((current) => ({ ...current, rolId: event.target.value }))}>
                <option value="">Seleccionar rol</option>
                {(roles.data ?? []).map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}
              </select>
              <input className="rounded-md border p-2" minLength={8} placeholder="Nueva contraseña (opcional)" type="password" value={userForm.contrasena} onChange={(event) => setUserForm((current) => ({ ...current, contrasena: event.target.value }))} />
              <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" disabled={!userForm.id || !userForm.rolId || updateUserRole.isPending || resetUserPassword.isPending} type="submit">Actualizar rol</button>
              <button className="rounded-md border px-3 py-2" disabled={!userForm.id || userForm.contrasena.length < 8 || resetUserPassword.isPending || updateUserRole.isPending} onClick={() => resetUserPassword.mutate({ id: userForm.id, contrasena: userForm.contrasena }, { onSuccess: (_, variables) => setUserForm((current) => current.id === variables.id ? { ...current, contrasena: "" } : current) })} type="button">Cambiar contraseña</button>
            </form>
          </Can>
        </section>
      </Can>

      <Can permission="roles:leer">
        <section>
          <h3 className="font-semibold">Roles y permisos</h3>
          <select className="mt-3 w-full max-w-md rounded-md border p-2" disabled={assignPermissions.isPending} value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)}>
            <option value="">Seleccionar rol</option>
            {(roles.data ?? []).map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}
          </select>
          {selectedRoleId ? (
            <div className="mt-4 rounded-md border p-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(permissions.data ?? []).map((permission) => (
                  <label className="flex gap-2 text-sm" key={permission.id}>
                    <input checked={selectedPermissionIds.includes(permission.id)} disabled={rolePermissions.isPending || rolePermissions.isError || assignPermissions.isPending} onChange={() => togglePermission(permission.id)} type="checkbox" />
                    <span>{permission.clave}</span>
                  </label>
                ))}
              </div>
              <Can permission="roles:permisos">
                <button className="mt-4 rounded-md bg-primary px-3 py-2 text-primary-foreground" disabled={rolePermissions.isPending || rolePermissions.isError || assignPermissions.isPending} onClick={() => assignPermissions.mutate({ roleId: selectedRoleId, permissionIds: selectedPermissionIds }, { onSettled: (_, __, variables) => setPermissionDrafts((current) => { const next = { ...current }; delete next[variables.roleId]; return next }) })} type="button">Guardar permisos</button>
              </Can>
            </div>
          ) : null}
        </section>
      </Can>
    </section>
  )
}
