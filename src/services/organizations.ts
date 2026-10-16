import { api } from "@/lib/api"
import {
  normalizeCollection,
  type CollectionResponse,
} from "@/lib/pagination"
import type { Organization } from "@/types/organization"

export const organizationsService = {
  async listAvailable(signal?: AbortSignal) {
    const response = await api.get<CollectionResponse<Organization>>(
      "/organizaciones/inventario",
      {
        params: { limit: 200, offset: 0 },
        signal,
        skipUnauthorizedEvent: true,
      },
    )

    return normalizeCollection(response).filter(
      (organization) => organization.activo,
    )
  },
}
