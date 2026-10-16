import assert from "node:assert/strict"
import { after, before, beforeEach, test } from "node:test"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

let server
let adminService
let integrationService
let checkoutService
let catalogService
let organizationsService
let calls
let replies
const originalFetch = globalThis.fetch
const originalWindow = globalThis.window
const originalStorage = globalThis.sessionStorage

before(async () => {
  const storage = new Map()
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  globalThis.window = {
    location: { origin: "http://localhost:3051" },
    dispatchEvent() {},
  }
  globalThis.fetch = async (url, options) => {
    calls.push({
      path: new URL(url).pathname,
      query: new URL(url).searchParams,
      method: options.method,
      body: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers,
    })
    assert.ok(replies.length, "Unexpected HTTP call")
    const { data = null, status = 200 } = replies.shift()
    return new Response(JSON.stringify({ data, codigo: status, error: status >= 400, mensaje: "contract response" }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }
  server = await createServer({
    configFile: false,
    root: fileURLToPath(new URL("../", import.meta.url)),
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    define: { "import.meta.env.VITE_API_URL": JSON.stringify("/api") },
    server: { middlewareMode: true, watch: null },
  })
  ;({ adminService } = await server.ssrLoadModule("/src/services/admin.ts"))
  ;({ integrationService } = await server.ssrLoadModule("/src/services/integration.ts"))
  ;({ checkoutService } = await server.ssrLoadModule("/src/services/checkout.ts"))
  ;({ catalogService } = await server.ssrLoadModule("/src/services/catalog.ts"))
  ;({ organizationsService } = await server.ssrLoadModule("/src/services/organizations.ts"))
})

beforeEach(() => { calls = []; replies = [] })
after(async () => {
  await server?.close()
  globalThis.fetch = originalFetch
  globalThis.window = originalWindow
  globalThis.sessionStorage = originalStorage
})

test("user commands use dedicated routes and bodies", async () => {
  replies.push({}, {}, {}, {})
  await adminService.updateUserRole("u1", "r1")
  await adminService.resetUserPassword("u1", "new-password")
  await adminService.deactivateUser("u1")
  await adminService.restoreUser("u1")
  assert.deepEqual(calls.map(({ path, method, body }) => ({ path, method, body })), [
    { path: "/api/usuarios/u1/rol", method: "PATCH", body: { rolId: "r1" } },
    { path: "/api/usuarios/u1/contrasena", method: "PATCH", body: { contrasena: "new-password" } },
    { path: "/api/usuarios/u1/desactivar", method: "PATCH", body: {} },
    { path: "/api/usuarios/u1/restaurar", method: "PATCH", body: {} },
  ])
})

test("permission reconciliation only adds and removes the delta", async () => {
  replies.push({ data: [{ id: "keep" }, { id: "remove" }] }, {}, {})
  await adminService.assignRolePermissions("r1", ["keep", "add", "add"])
  assert.deepEqual(calls.map(({ path, method, body }) => ({ path, method, body })), [
    { path: "/api/roles/r1/permisos", method: "GET", body: undefined },
    { path: "/api/roles/r1/permisos", method: "POST", body: { permisoId: "add" } },
    { path: "/api/roles/r1/permisos/remove", method: "DELETE", body: undefined },
  ])
})

test("permission retry reads actual state and stops on failure", async () => {
  replies.push({ data: [] }, {}, { status: 403 })
  await assert.rejects(adminService.assignRolePermissions("r1", ["a", "b", "c"]))
  assert.equal(calls.length, 3)
  calls = []
  replies.push({ data: [{ id: "a" }] }, {}, {})
  await adminService.assignRolePermissions("r1", ["a", "b", "c"])
  assert.deepEqual(calls.slice(1).map((call) => call.body), [{ permisoId: "b" }, { permisoId: "c" }])
})

test("unchanged permissions require no mutation", async () => {
  replies.push({ data: [{ id: "a" }] })
  await adminService.assignRolePermissions("r1", ["a"])
  assert.equal(calls.length, 1)
})

test("catalog synchronization includes branch and publication choice", async () => {
  replies.push({})
  await integrationService.synchronizeCatalog({ sucursalId: "branch-1", publicar: false })
  assert.equal(calls[0].path, "/api/integraciones/inventario/catalogo/sincronizar")
  assert.deepEqual(calls[0].body, { sucursalId: "branch-1", publicar: false })
})

test("checkout can omit branch without omitting its idempotency key", async () => {
  replies.push({})
  await checkoutService.submit("cart-1", {
    sucursalId: undefined,
    direccionEntrega: "Address",
    minutosExpiracion: 30,
  }, "checkout-key")
  assert.equal(calls[0].path, "/api/carritos/cart-1/checkout")
  assert.equal(Object.hasOwn(calls[0].body, "sucursalId"), false)
  assert.equal(calls[0].headers["Idempotency-Key"], "checkout-key")
})

test("organization selector uses the public auxiliary inventory endpoint", async () => {
  replies.push({ data: { items: [{ id: "org-1", nombre: "Tienda", codigo: "store-1", activo: true }], pagination: { limit: 200, offset: 0, total: 1, hasMore: false } } })
  const organizations = await organizationsService.listAvailable()
  assert.equal(organizations.length, 1)
  assert.equal(calls[0].path, "/api/organizaciones/inventario")
})

test("public product listing scopes tenant, filters and pagination without variants", async () => {
  replies.push({ data: { items: [{ id: "p-1", nombre: "Camisa", slug: "camisa" }], pagination: { limit: 20, offset: 0, total: 1, hasMore: false } } })
  await catalogService.list({ organizacionCodigo: "store-1", nombre: "camisa", limit: 20, offset: 0 })
  assert.equal(calls[0].path, "/api/catalogo/productos")
  assert.equal(calls[0].query.get("organizacionCodigo"), "store-1")
  assert.equal(calls[0].query.get("nombre"), "camisa")
  assert.equal(calls[0].query.get("limit"), "20")
})

test("catalog category filter includes categories from every page", async () => {
  replies.push(
    { data: { items: [{ categoriaSlug: "ropa", categoriaNombre: "Ropa" }], pagination: { limit: 200, offset: 0, total: 201, hasMore: true } } },
    { data: { items: [{ categoriaSlug: "calzado", categoriaNombre: "Calzado" }], pagination: { limit: 200, offset: 1, total: 201, hasMore: false } } },
  )
  const categories = await catalogService.listCategories({ organizacionCodigo: "store-1" })
  assert.deepEqual(categories.map((category) => category.slug), ["calzado", "ropa"])
  assert.deepEqual(calls.map((call) => call.query.get("offset")), ["0", "1"])
})

test("product detail includes the selected tenant for its SKU lookup", async () => {
  replies.push({ data: { id: "p-1", slug: "camisa", variantes: [{ productoVarianteId: "sku-1", sku: "CAM-AZ-M" }] } })
  const product = await catalogService.getBySlug("camisa", { organizacionSlug: "tienda" })
  assert.equal(product.variantes[0].productoVarianteId, "sku-1")
  assert.equal(calls[0].path, "/api/catalogo/productos/camisa")
  assert.equal(calls[0].query.get("organizacionSlug"), "tienda")
})

for (const compensate of [false, true]) {
  test(`reversal sends explicit compensation=${compensate} and idempotency key`, async () => {
    replies.push({})
    const payload = {
      accion: compensate ? "compensacion_inventario" : "compensacion_manual",
      compensarInventario: compensate,
      observacion: "Resolution confirmed by operator",
    }
    await integrationService.resolveReversal("order-1", payload, "stable-key")
    assert.equal(calls[0].path, "/api/integraciones/inventario/postventa/reversas/order-1/resolver")
    assert.deepEqual(calls[0].body, payload)
    assert.equal(calls[0].headers["Idempotency-Key"], "stable-key")
  })
}
