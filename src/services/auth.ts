import { api } from "@/lib/api"
import type {
  AuthContextData,
  LoginRequest,
  LoginResponse,
} from "@/types/auth"

export const authService = {
  login: (payload: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", payload, {
      skipUnauthorizedEvent: true,
    }),
  me: () => api.get<AuthContextData>("/auth/me"),
}
