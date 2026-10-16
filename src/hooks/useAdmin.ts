import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { adminService } from "@/services/admin"
import type { PaginatedData } from "@/types/common"

const adminKey = ["admin"] as const

export function useAdminPage<T>(
  resource: string,
  loader: (options: {
    limit: number
    offset: number
    signal?: AbortSignal
  }) => Promise<PaginatedData<T>>,
  limit = 50,
  offset = 0,
) {
  return useQuery({
    queryKey: [...adminKey, resource, limit, offset],
    queryFn: ({ signal }) => loader({ limit, offset, signal }),
  })
}

export function useAdminCollection<T>(
  resource: string,
  loader: (signal?: AbortSignal) => Promise<T[]>,
) {
  return useQuery({
    queryKey: [...adminKey, resource],
    queryFn: ({ signal }) => loader(signal),
  })
}

export function useAdminAction<TVariables>(
  action: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: action,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKey })
      queryClient.invalidateQueries({ queryKey: ["catalogo"] })
    },
  })
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: [...adminKey, "roles", roleId, "permisos"],
    queryFn: ({ signal }) =>
      adminService.listRolePermissions(roleId, signal),
    enabled: Boolean(roleId),
  })
}
