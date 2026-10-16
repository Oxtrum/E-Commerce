export interface LoginRequest {
  email: string
  contrasena: string
  codigoOrganizacion: string
}

export interface SessionUser {
  id: string
  organizacionId?: string
  organizacionCodigo?: string
  email: string
  nombres?: string | null
  apellidos?: string | null
  rolId: string
  rolCodigo: string
  esSuperusuario: boolean
  fechaCreacion: string
}

export interface LoginResponse {
  token: string
  usuario: SessionUser
  permisos: string[]
}

export interface AuthContextData {
  usuarioId: string
  organizacionId?: string
  email: string
  rolId: string
  rolCodigo: string
  esSuperusuario: boolean
  permisos: string[]
}
