import { useQuery } from "@tanstack/react-query"

import { catalogService } from "@/services/catalog"
import type { CatalogFilters } from "@/types/catalog"

export const catalogKeys = {
  all: ["catalogo"] as const,
  lists: () => [...catalogKeys.all, "lista"] as const,
  list: (filters: CatalogFilters) => [...catalogKeys.lists(), filters] as const,
  details: () => [...catalogKeys.all, "detalle"] as const,
  detail: (slug: string, organization: string) =>
    [...catalogKeys.details(), slug, organization] as const,
  categories: (organization: string) =>
    [...catalogKeys.all, "categorias", organization] as const,
}

export function useCatalogCategories(
  organization: Pick<
    CatalogFilters,
    "organizacionSlug" | "organizacionCodigo"
  >,
) {
  const organizationKey =
    organization.organizacionSlug ?? organization.organizacionCodigo ?? ""

  return useQuery({
    queryKey: catalogKeys.categories(organizationKey),
    queryFn: ({ signal }) =>
      catalogService.listCategories(organization, signal),
    enabled: Boolean(organizationKey),
  })
}

export function useCatalog(filters: CatalogFilters) {
  const hasOrganization = Boolean(
    filters.organizacionSlug || filters.organizacionCodigo,
  )

  return useQuery({
    queryKey: catalogKeys.list(filters),
    queryFn: ({ signal }) => catalogService.list(filters, signal),
    enabled: hasOrganization,
  })
}

export function useCatalogProduct(
  slug: string,
  organization: Pick<
    CatalogFilters,
    "organizacionSlug" | "organizacionCodigo"
  >,
) {
  const organizationKey =
    organization.organizacionSlug ?? organization.organizacionCodigo ?? ""

  return useQuery({
    queryKey: catalogKeys.detail(slug, organizationKey),
    queryFn: ({ signal }) =>
      catalogService.getBySlug(slug, organization, signal),
    enabled: Boolean(slug && organizationKey),
  })
}
