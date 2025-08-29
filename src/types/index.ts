export interface User {
  id: number
  display_name: string
  email: string
  is_active: boolean
  is_admin: boolean
}

export interface Event {
  id: number
  title: string
  description: string
  start_datetime: string
  location?: string
  participant_count: number
}

export interface Service {
  id: number
  title: string
  description: string
  is_offering: boolean
}
