const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return await response.json()
  }

  // Auth endpoints
  auth = {
    login: (data: any) => this.request<{access_token: string}>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    register: (data: any) => this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    me: () => this.request('/api/auth/me'),
  }

  // Events endpoints
  events = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/events/${params ? '?' + params.toString() : ''}`),
    get: (id: number) => this.request(`/api/events/${id}`),
    join: (id: number) => this.request(`/api/events/${id}/join`, { method: 'POST' }),
  }

  // Services endpoints
  services = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/services/${params ? '?' + params.toString() : ''}`),
  }

  // Forum endpoints
  discussions = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/discussions/${params ? '?' + params.toString() : ''}`),
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
