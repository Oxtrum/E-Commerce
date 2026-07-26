# E-Commerce Front

Frontend web del ecosistema e-commerce. La aplicación ofrece la tienda pública, la experiencia de compra del cliente y el backoffice comercial consumiendo exclusivamente la API `e-commerceApi`.

Este proyecto toma como base las tecnologías, convenciones y arquitectura de `Inventarios-Front`, adaptadas al dominio comercial. El frontend no administra el stock como fuente de verdad ni se conecta directamente con Inventario SaaS: esa integración corresponde a `e-commerceApi`.

## Objetivo

Construir una SPA modular que cubra:

- Catálogo público, búsqueda, filtros y detalle de productos.
- Carrito y checkout.
- Autenticación y perfil del cliente.
- Direcciones de entrega y facturación.
- Pedidos y seguimiento de estados.
- Pagos y visualización de sus resultados.
- Comprobantes o facturas disponibles para el cliente.
- Promociones, cupones y descuentos.
- Backoffice de catálogo, clientes, pedidos, pagos, facturas y reportes.

## Estado actual

Este README describe sobre todo el **destino**. Lo construido hasta ahora es la
Fase 2 parcial:

| Superficie | Estado |
|---|---|
| Tienda (`/`) | Hero, buscador con debounce, grilla de productos, pasos de compra, FAQ |
| `/plataforma` | Pagina de presentacion, enlazada desde el pie ("Vende con nosotros") |
| `404` | Listo |
| Catalogo (`/catalogo`, `/producto/:slug`) | No implementado |
| Carrito y checkout | No implementado |
| Area de cliente (`/mi-cuenta/*`) | No implementado |
| Backoffice (`/admin/*`) | No implementado |

Existe una porcion minima de catalogo de solo lectura respetando el layering:
`types/catalogo.ts` -> `services/catalogo.ts` -> `hooks/useCatalogo.ts`. Usa
`VITE_ORGANIZACION_SLUG`; si queda vacia, la API responde `400` en cada peticion y
la tienda aparece sin productos.

No hay imagenes de producto reales. Los espacios sin `imagenPrincipal` usan un
marcador generado con CSS, y la ilustracion del hero (`components/store/HeroArt.tsx`)
es un SVG en linea construido con los tokens del tema, de modo que responde al modo
claro y oscuro sin archivos externos.

## Arquitectura del ecosistema

```text
Navegador
   |
   | HTTPS / JSON
   v
e-commerceFront
   |
   | VITE_API_URL
   v
e-commerceApi
   |
   | Integración privada backend-to-backend
   v
Inventario SaaS API
```

Reglas de integración:

- El navegador solo consume `e-commerceApi`.
- Las URL, credenciales y tokens de Inventario SaaS nunca se exponen en el frontend.
- `e-commerceApi` es responsable de catálogo comercial, clientes, carritos, pedidos, pagos, facturas y reportes comerciales.
- Inventario SaaS es la fuente de verdad de productos operativos, stock, movimientos y reservas.
- El frontend muestra disponibilidad informada por `e-commerceApi`, pero no calcula ni descuenta stock localmente.
- El checkout se considera confirmado únicamente cuando la API responde con el estado definitivo del pedido/pago.
- Los importes, impuestos, descuentos y totales enviados por el navegador no son confiables: la API debe recalcularlos y validarlos.

### Correcciones pendientes de subir a `E-CommerceSaaS-Api`

Se anotan aquí porque ese repositorio no acepta escritura desde la cuenta que
mantiene este frontend. Los commits existen solo en la copia local y hay parches
exportados en `../parches-ecommerce-api/`. **Quien obtenga acceso de escritura debe
subirlos**; hasta entonces, cualquiera que clone `E-CommerceSaaS-Api` desde su origin
recibe la version sin corregir.

| Correccion | Sintoma sin ella | Urgencia |
|---|---|---|
| `ClaimDueEvents`: calificar las columnas del `RETURNING` | La consulta devuelve `column reference "id" is ambiguous` en **todas** las llamadas. Es la unica que usa `cmd/integracion-outbox`, asi que el worker de reintentos nunca reclama un evento | Baja hoy, alta en produccion |
| CORS: emitir cabeceras en el preflight | El `OPTIONS` responde `204` sin cabeceras `Access-Control-*` y el navegador bloquea la peticion real. El `204` engaña: parece que el preflight paso | Media |
| `.gitignore`: ignorar los binarios de `cmd/` | `integracion-outbox` son 26 MB de ELF sin cubrir por las reglas actuales | Baja |

Sobre la urgencia del primero: verificado contra la base, los seis eventos de
integracion existentes estan en `procesado`, ninguno en `reintentable`. El fallo
nunca se ha manifestado porque todas las llamadas a Inventario salieron bien a la
primera. Importa el dia que una falle por red: el evento queda en `reintentable` y
nadie lo drena, lo que deja una reserva sin confirmar y un pedido colgado.

Mientras la correccion de CORS no este subida, se puede evitar por completo con un
proxy de desarrollo en `vite.config.ts` (`server.proxy`), que convierte la peticion
en same-origin y elimina el preflight.

## Stack base

Se conserva el stack de `Inventarios-Front`:

- React 19.
- TypeScript.
- Vite.
- React Router DOM.
- Tailwind CSS 4.
- shadcn/ui y Radix UI.
- TanStack Query para estado remoto y caché.
- TanStack Table para tablas del backoffice.
- React Hook Form y Zod para formularios y validaciones de experiencia de usuario.
- Lucide React y Tabler Icons.
- Sonner para notificaciones.
- Recharts para métricas y reportes.
- `@fontsource-variable/inter` como tipografía base.
- ESLint con reglas para TypeScript, React Hooks y React Refresh.

La compilación debe mantener React Compiler, el alias `@` hacia `src` y la integración de Tailwind mediante el plugin de Vite, igual que en el frontend de inventarios.

## Principios de arquitectura

El flujo de dependencias por dominio es:

```text
types -> services -> hooks -> pages
                       |
                       v
                 components
```

- `types/` define los contratos TypeScript que refleja la API.
- `services/` contiene llamadas HTTP sin lógica visual.
- `hooks/` encapsula queries, mutations, claves de caché e invalidaciones.
- `pages/` compone cada ruta y coordina sus estados de interfaz.
- `components/` contiene piezas reutilizables, layout y componentes de dominio.
- `context/` se reserva para estado transversal: sesión, tema, carrito y configuración de tienda.
- `lib/` concentra el cliente HTTP, utilidades, validaciones compartidas y configuración transversal.

No se deben realizar llamadas `fetch` directamente desde páginas o componentes. Tampoco se deben duplicar tipos de respuesta dentro de cada pantalla.

## Estructura propuesta

```text
e-commerceFront/
|-- public/
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- cart/
|   |   |-- catalog/
|   |   |-- checkout/
|   |   |-- layout/
|   |   |-- orders/
|   |   |-- reports/
|   |   |-- shared/
|   |   `-- ui/
|   |-- context/
|   |   |-- auth-provider.tsx
|   |   |-- cart-provider.tsx
|   |   `-- theme-provider.tsx
|   |-- hooks/
|   |   |-- useAuth.ts
|   |   |-- useCart.ts
|   |   |-- useCatalog.ts
|   |   |-- useCheckout.ts
|   |   |-- useOrders.ts
|   |   `-- usePayments.ts
|   |-- lib/
|   |   |-- api.ts
|   |   |-- query-client.ts
|   |   |-- routes.ts
|   |   |-- utils.ts
|   |   `-- validation.ts
|   |-- pages/
|   |   |-- account/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- cart/
|   |   |-- catalog/
|   |   |-- checkout/
|   |   |-- home/
|   |   |-- orders/
|   |   `-- product/
|   |-- services/
|   |   |-- auth.ts
|   |   |-- cart.ts
|   |   |-- catalog.ts
|   |   |-- checkout.ts
|   |   |-- customers.ts
|   |   |-- invoices.ts
|   |   |-- orders.ts
|   |   |-- payments.ts
|   |   |-- promotions.ts
|   |   `-- reports.ts
|   |-- types/
|   |   |-- auth.ts
|   |   |-- cart.ts
|   |   |-- catalog.ts
|   |   |-- common.ts
|   |   |-- customer.ts
|   |   |-- invoice.ts
|   |   |-- order.ts
|   |   |-- payment.ts
|   |   `-- promotion.ts
|   |-- App.tsx
|   |-- index.css
|   `-- main.tsx
|-- .env.example
|-- components.json
|-- eslint.config.js
|-- package.json
|-- tsconfig.app.json
`-- vite.config.ts
```

Los nombres de dominio pueden ajustarse al contrato real de `e-commerceApi`, pero deben conservarse las responsabilidades de cada capa.

## Superficies y rutas base

### Tienda pública

```text
/                         Inicio
/catalogo                 Listado y filtros
/producto/:slug           Detalle de producto
/carrito                  Carrito
/checkout                 Datos y confirmación de compra
/checkout/resultado       Resultado controlado del flujo
/login                    Acceso del cliente
/registro                 Registro del cliente
```

### Área del cliente

```text
/mi-cuenta                Perfil
/mi-cuenta/direcciones    Direcciones
/mi-cuenta/pedidos        Historial de pedidos
/mi-cuenta/pedidos/:id    Detalle y seguimiento
/mi-cuenta/facturas       Documentos fiscales disponibles
```

### Backoffice protegido

```text
/admin                    Dashboard comercial
/admin/catalogo           Publicación y contenido comercial
/admin/pedidos            Gestión de pedidos
/admin/clientes           Gestión de clientes
/admin/promociones        Promociones y cupones
/admin/pagos              Consulta y conciliación de pagos
/admin/facturas           Consulta fiscal
/admin/reportes           Reportes comerciales
```

Las rutas públicas, de cliente y administrativas deben usar layouts separados. Las rutas protegidas deben validar sesión y, para el backoffice, permisos devueltos por la API.

## Estado y obtención de datos

### Estado remoto

TanStack Query administra:

- Catálogo, categorías, disponibilidad y detalle de producto.
- Carrito persistido por la API.
- Pedidos, pagos y facturas.
- Perfil y direcciones del cliente.
- Datos y reportes del backoffice.

Cada dominio debe declarar claves de query estables. Ejemplo conceptual:

```ts
export const catalogKeys = {
  all: ["catalog"] as const,
  lists: () => [...catalogKeys.all, "list"] as const,
  list: (filters: CatalogFilters) => [...catalogKeys.lists(), filters] as const,
  detail: (slug: string) => [...catalogKeys.all, "detail", slug] as const,
}
```

Después de una mutation se invalidan únicamente las queries afectadas. No se debe recargar toda la aplicación para reflejar cambios.

### Estado local y transversal

- `AuthProvider`: sesión y usuario actual.
- `CartProvider`: resumen visual del carrito y coordinación con el carrito persistido.
- `ThemeProvider`: tema visual.
- Estado efímero de formularios y modales: permanece en el componente o en React Hook Form.

No se debe copiar una respuesta de TanStack Query a un contexto sin una necesidad concreta.

## Cliente HTTP y contrato de API

El acceso HTTP debe estar centralizado en `src/lib/api.ts`, siguiendo la idea de `Inventarios-Front`:

- Construir la URL desde `VITE_API_URL`.
- Serializar parámetros de consulta de forma uniforme.
- Aplicar la estrategia de autenticación definida por `e-commerceApi`.
- Interpretar el envelope estándar.
- Convertir errores de API en un `ApiError` tipado.
- Cancelar solicitudes mediante `AbortSignal` cuando corresponda.
- Redirigir o limpiar la sesión ante un `401` solo desde una política centralizada.

Contrato esperado mientras `e-commerceApi` conserve el estándar del ecosistema:

```ts
export interface ApiResponse<T> {
  data: T
  codigo: number
  error: boolean
  mensaje: string
}
```

Respuesta exitosa:

```json
{
  "data": {},
  "codigo": 200,
  "error": false,
  "mensaje": ""
}
```

Respuesta con error:

```json
{
  "data": null,
  "codigo": 409,
  "error": true,
  "mensaje": "No fue posible completar la operación"
}
```

Los paths y DTO deben validarse contra la documentación vigente de `e-commerceApi` antes de implementar cada servicio. El frontend no debe asumir que los endpoints internos de Inventario SaaS también son públicos en `e-commerceApi`.

## Autenticación y autorización

Se deben contemplar dos perfiles de acceso:

- Cliente: compra, perfil, direcciones, pedidos y facturas propias.
- Operador o administrador: módulos del backoffice según permisos.

Lineamientos:

- Preferir sesión mediante cookie segura `HttpOnly`, `Secure` y `SameSite` si `e-commerceApi` la soporta.
- Si la API entrega JWT al cliente, su persistencia y renovación deben quedar encapsuladas en `AuthProvider` y `lib/api.ts`.
- Nunca guardar secretos de pasarelas, credenciales server-to-server o tokens de Inventario SaaS en variables `VITE_*`.
- No confiar en roles, permisos, precios, descuentos o propiedad de recursos calculados solo en el navegador.
- Las protecciones de ruta mejoran la UX; la autorización real siempre se valida en la API.

## Carrito, checkout y pagos

El carrito puede ofrecer una respuesta inmediata en la interfaz, pero `e-commerceApi` debe validar cada operación.

Flujo esperado:

1. El cliente agrega o modifica productos en el carrito.
2. El frontend solicita a `e-commerceApi` el resumen recalculado.
3. El cliente completa datos de entrega, facturación y método de pago.
4. El frontend envía una intención de checkout; no confirma stock por su cuenta.
5. `e-commerceApi` crea el pedido y coordina la reserva con Inventario SaaS.
6. La pasarela o la API procesa el pago.
7. El frontend consulta o recibe el resultado normalizado desde `e-commerceApi`.
8. La pantalla final muestra el estado real del pedido: pendiente, confirmado, rechazado o en revisión.

Reglas críticas:

- Evitar pedidos duplicados deshabilitando reenvíos y usando la clave de idempotencia que defina la API.
- No considerar exitoso un pago por parámetros manipulables de la URL.
- No invocar webhooks de pago desde el frontend.
- Ante timeout o respuesta incierta, consultar el pedido antes de repetir la operación.
- Mostrar mensajes comerciales; los detalles técnicos quedan en observabilidad de la API.

## Formularios y validación

- Usar React Hook Form para estado y envío.
- Usar esquemas Zod compartidos desde `lib/validation.ts` o desde el dominio correspondiente.
- Mantener separados los DTO de API y los valores del formulario cuando su forma sea distinta.
- La validación del frontend ayuda al usuario, pero no reemplaza la validación de `e-commerceApi`.
- Los errores por campo devueltos por la API deben mapearse al formulario cuando el contrato los incluya.

## Diseño y componentes

Los tokens viven en `src/index.css` y se declaran en **OKLCH**, no en hex. La paleta
es cálida —espresso, ámbar y arena— con un contrapunto frío (`--teal`, matiz 195) que
evita que todo caiga en la misma familia de matices y se vea plano.

Dos reglas que no se pueden romper, medidas con contraste real:

- **`--accent` es superficie, nunca texto** (2.13:1). Para texto usa `--accent-strong` (5.53:1).
- **`--border` es decorativo** (1.38:1). Los bordes de controles usan `--border-strong` (3.81:1), que sí cumple el 3:1 de WCAG 1.4.11.

Las escalas verificadas de estados, los planos de componentes y las reglas de
redacción están en `.agents/skills/ecommerce-ui-design`. La §2.6 cubre la voz: frases
simples antes que ingeniosas, títulos de sección como preguntas o etiquetas llanas,
pasos en imperativo, y nunca prometer comportamiento que el sistema no tiene.

Hay utilidades propias en `index.css`: `.grain`, `.text-gradient-warm`, `.sheen`,
`.animate-float` y `.animate-marquee`, todas anuladas bajo `prefers-reduced-motion`.

La base visual conserva Tailwind CSS, shadcn/ui, Radix UI e Inter. Deben reutilizarse patrones equivalentes a `Inventarios-Front`:

- `components/ui`: primitivas visuales sin reglas del negocio.
- `components/shared`: estados vacíos, carga, error, confirmaciones y encabezados.
- `components/<dominio>`: tarjetas de producto, resumen del carrito, estado del pedido y widgets específicos.
- `components/layout`: header público, navegación, footer, layout de cuenta y layout administrativo.

Requisitos mínimos de experiencia:

- Diseño responsive desde móvil.
- Navegación completa por teclado.
- Labels y mensajes de error accesibles.
- Estados explícitos de carga, vacío, error y reintento.
- Imágenes con dimensiones reservadas y texto alternativo.
- Formato de moneda y fechas mediante `Intl`, usando moneda y zona horaria provistas por la configuración de tienda.
- Confirmaciones visibles para acciones sensibles del backoffice.

## Variables de entorno

Crear `.env.local` a partir de `.env.example`:

```bash
VITE_API_URL=http://localhost:8080/api
```

`VITE_API_URL` debe apuntar a `e-commerceApi`, no a Inventario SaaS. Ajustar host y puerto al entorno real del backend.

Solo deben usarse variables `VITE_*` para datos públicos. Vite incorpora esas variables al bundle del navegador; por tanto, no son aptas para secretos.

## Configuración local

Requisitos:

- Node.js compatible con la versión de Vite definida en `package.json`.
- npm.
- `e-commerceApi` disponible y con CORS o cookies configuradas para el origen del frontend.

Una vez incorporado el scaffold base:

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

En Bash, el equivalente para la variable local es:

```bash
cp .env.example .env.local
```

El servidor de desarrollo debe conservar el puerto `3050` usado por `Inventarios-Front`, salvo que exista un conflicto entre ambos proyectos. En ese caso se recomienda `3051` para e-commerce.

## Scripts esperados

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Type-check y build de producción
npm run lint      # Análisis estático
npm run preview   # Vista previa del build
```

Antes de entregar cambios se debe ejecutar, como mínimo:

```bash
npm run lint
npm run build
```

## Convenciones

- Componentes y páginas: `PascalCase` cuando el archivo exporta una entidad nombrada; `index.tsx` para la entrada de una página, siguiendo el proyecto base.
- Hooks: prefijo `use` y nombres de dominio claros.
- Servicios: objetos o funciones sin dependencia de React.
- Tipos: nombres de negocio en singular y DTO explícitos para request/response.
- Imports internos mediante `@/`.
- Textos visibles en español y nombres técnicos consistentes con el contrato de la API.
- No usar `any`; modelar estados parciales o desconocidos de forma explícita.
- No mezclar lógica de tienda pública con permisos del backoffice.
- No introducir una nueva librería si el stack base ya resuelve el caso.

## Manejo de errores

Casos mínimos:

- `400` o `422`: mostrar errores de validación útiles.
- `401`: recuperar o finalizar la sesión según la estrategia de la API.
- `403`: mostrar acceso denegado sin ocultar que la API es la autoridad.
- `404`: presentar una página o recurso no encontrado.
- `409`: informar conflictos de stock, cupón, estado de pedido o idempotencia.
- `429`: indicar límite temporal y respetar `Retry-After` si está disponible.
- `500+`: mostrar un mensaje recuperable y registrar contexto no sensible.

Debe existir un error boundary global y boundaries locales donde una falla parcial no deba derribar toda la tienda.

## Fases de implementación

### Fase 1: base técnica

- Scaffold React + TypeScript + Vite.
- Tailwind, shadcn/ui, alias `@` y tema.
- Cliente HTTP y `ApiError`.
- Query client, router, layouts y error boundary.
- Tipos comunes y envelope de API.

### Fase 2: experiencia pública

- Inicio, catálogo, filtros y detalle de producto.
- Componentes responsive y estados de carga/error.
- Carrito persistido mediante `e-commerceApi`.

### Fase 3: cliente y compra

- Registro, login, perfil y direcciones.
- Checkout.
- Resultado de pago.
- Pedidos, seguimiento y facturas del cliente.

### Fase 4: backoffice

- Layout y autorización por permisos.
- Catálogo comercial y promociones.
- Clientes, pedidos, pagos y facturas.
- Reportes comerciales.

### Fase 5: endurecimiento

- Pruebas de flujos críticos.
- Accesibilidad y rendimiento.
- Observabilidad sin datos sensibles.
- Revisión de seguridad, expiración de sesión e idempotencia.

## Alcance y fuente de verdad

Este README define la configuración y arquitectura base del frontend. La documentación de `e-commerceApi` es la fuente de verdad para:

- Endpoints y métodos HTTP.
- DTO de entrada y salida.
- Estrategia de sesión.
- Permisos.
- Paginación y filtros.
- Estados de pedidos, pagos y facturas.
- Integración con pasarelas.

Si el contrato real difiere de los ejemplos de este documento, se actualizan primero los tipos y servicios; las páginas no deben compensar inconsistencias construyendo contratos alternativos.
