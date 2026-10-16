import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { AccountLayout } from "@/components/layout/AccountLayout"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { BackofficeLayout } from "@/components/layout/BackofficeLayout"
import { StoreLayout } from "@/components/layout/StoreLayout"
import { OrganizationRoute } from "@/components/shared/OrganizationRoute"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import {
  RequireAnyPermission,
  RequirePermission,
} from "@/components/shared/RequirePermission"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/context/auth-provider"
import { CustomerProvider } from "@/context/customer-provider"
import { OrganizationProvider } from "@/context/organization-provider"
import { ThemeProvider } from "@/context/theme-provider"
import { queryClient } from "@/lib/query-client"
import AccountHomePage from "@/pages/account"
import AccountAddressesPage from "@/pages/account/addresses"
import AccountInvoiceDetailPage from "@/pages/account/invoice-detail"
import AccountInvoicesPage from "@/pages/account/invoices"
import AccountOrderDetailPage from "@/pages/account/order-detail"
import AccountOrdersPage from "@/pages/account/orders"
import AdminHomePage from "@/pages/admin"
import AdminAccessPage from "@/pages/admin/access"
import AdminCatalogPage from "@/pages/admin/catalog"
import AdminCommercialPage from "@/pages/admin/commercial"
import AdminCustomersPage from "@/pages/admin/customers"
import AdminIntegrationPage from "@/pages/admin/integration"
import CartPage from "@/pages/cart"
import CatalogPage from "@/pages/catalog"
import CheckoutPage from "@/pages/checkout"
import CheckoutResultPage from "@/pages/checkout/result"
import ForbiddenPage from "@/pages/forbidden"
import HomePage from "@/pages/home"
import PlataformaPage from "@/pages/plataforma"
import LoginPage from "@/pages/login"
import NotFoundPage from "@/pages/not-found"
import OrganizationSelectionPage from "@/pages/organization-selection"
import ProductPage from "@/pages/product"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <AuthProvider>
          <CustomerProvider>
            <ThemeProvider defaultTheme="system">
              <TooltipProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<StoreLayout />}>
                      <Route path="plataforma" element={<PlataformaPage />} />
                    </Route>
                    <Route element={<AuthLayout />}>
                      <Route
                        path="seleccionar-tienda"
                        element={<OrganizationSelectionPage />}
                      />
                    </Route>

                    <Route element={<OrganizationRoute />}>
                      <Route element={<AuthLayout />}>
                        <Route path="login" element={<LoginPage />} />
                      </Route>

                      <Route element={<StoreLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="catalogo" element={<CatalogPage />} />
                        <Route path="producto/:slug" element={<ProductPage />} />
                        <Route path="403" element={<ForbiddenPage />} />

                        <Route element={<ProtectedRoute />}>
                          <Route path="carrito" element={<CartPage />} />
                          <Route
                            path="checkout/:cartId"
                            element={<CheckoutPage />}
                          />
                          <Route
                            path="checkout/resultado"
                            element={<CheckoutResultPage />}
                          />

                          <Route element={<AccountLayout />} path="mi-cuenta">
                            <Route index element={<AccountHomePage />} />
                            <Route
                              path="direcciones"
                              element={<AccountAddressesPage />}
                            />
                            <Route
                              path="pedidos"
                              element={<AccountOrdersPage />}
                            />
                            <Route
                              path="pedidos/:id"
                              element={<AccountOrderDetailPage />}
                            />
                            <Route
                              path="facturas"
                              element={<AccountInvoicesPage />}
                            />
                            <Route
                              path="facturas/:id"
                              element={<AccountInvoiceDetailPage />}
                            />
                          </Route>

                          <Route element={<BackofficeLayout />} path="admin">
                            <Route
                              index
                              element={
                                <RequireAnyPermission
                                  permissions={[
                                    "catalogo:leer",
                                    "clientes:leer",
                                    "pedidos:leer",
                                    "organizaciones:leer",
                                    "integraciones_inventario:leer",
                                  ]}
                                >
                                  <AdminHomePage />
                                </RequireAnyPermission>
                              }
                            />
                            <Route
                              path="catalogo"
                              element={
                                <RequirePermission permission="catalogo:leer">
                                  <AdminCatalogPage />
                                </RequirePermission>
                              }
                            />
                            <Route
                              path="clientes"
                              element={
                                <RequirePermission permission="clientes:leer">
                                  <AdminCustomersPage />
                                </RequirePermission>
                              }
                            />
                            <Route
                              path="comercial"
                              element={
                                <RequirePermission permission="pedidos:leer">
                                  <AdminCommercialPage />
                                </RequirePermission>
                              }
                            />
                            <Route
                              path="acceso"
                              element={
                                <RequirePermission permission="organizaciones:leer">
                                  <AdminAccessPage />
                                </RequirePermission>
                              }
                            />
                            <Route
                              path="inventario"
                              element={
                                <RequirePermission permission="integraciones_inventario:leer">
                                  <AdminIntegrationPage />
                                </RequirePermission>
                              }
                            />
                          </Route>
                        </Route>
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Route>
                  </Routes>
                </BrowserRouter>
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </CustomerProvider>
        </AuthProvider>
      </OrganizationProvider>
    </QueryClientProvider>
  )
}

export default App
