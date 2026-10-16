import { useQuery } from "@tanstack/react-query"

import { organizationsService } from "@/services/organizations"

const organizationsKey = ["organizaciones", "disponibles"] as const

export function useAvailableOrganizations(enabled = true) {
  return useQuery({
    queryKey: organizationsKey,
    queryFn: ({ signal }) => organizationsService.listAvailable(signal),
    enabled,
    retry: false,
  })
}
