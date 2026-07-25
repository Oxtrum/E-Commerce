import { useQuery } from "@tanstack/react-query"

import { catalogoService } from "@/services/catalogo"
import type { CatalogoFiltros } from "@/types/catalogo"

export const catalogoKeys = {
  all: ["catalogo"] as const,
  lists: () => [...catalogoKeys.all, "list"] as const,
  list: (filtros: CatalogoFiltros) =>
    [...catalogoKeys.lists(), filtros] as const,
  detail: (slug: string) => [...catalogoKeys.all, "detail", slug] as const,
}

export function useCatalogo(filtros: CatalogoFiltros = {}) {
  return useQuery({
    queryKey: catalogoKeys.list(filtros),
    queryFn: ({ signal }) => catalogoService.listar(filtros, { signal }),
  })
}

export function useProductoPorSlug(slug: string) {
  return useQuery({
    queryKey: catalogoKeys.detail(slug),
    queryFn: ({ signal }) => catalogoService.obtenerPorSlug(slug, { signal }),
    enabled: Boolean(slug),
  })
}
