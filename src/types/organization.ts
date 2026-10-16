export interface Organization {
  id?: string
  nombre: string
  codigo: string
  slug?: string
  plan?: string
  emailContacto?: string | null
  telefono?: string | null
  pais?: string
  monedaBase?: string
  zonaHoraria?: string
  metadata?: Record<string, unknown>
  activo: boolean
}
