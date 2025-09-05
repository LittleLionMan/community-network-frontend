const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  display_name: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface ProfileUpdateData {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;

  email_private?: boolean;
  first_name_private?: boolean;
  last_name_private?: boolean;
  bio_private?: boolean;
  location_private?: boolean;
  created_at_private?: boolean;
}

interface PasswordUpdateData {
  current_password: string;
  new_password: string;
}

interface ProfileImageResponse {
  profile_image_url: string;
  message: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  }

  auth = {
    login: (data: LoginCredentials) =>
      this.request<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    register: (data: RegisterData) =>
      this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () => this.request('/api/auth/me'),

    checkAvailability: (data: { email?: string; display_name?: string }) =>
      this.request<{ available: boolean; message?: string }>(
        '/api/auth/check-availability',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),

    resendVerification: (data: { email: string }) =>
      this.request<{ message: string }>('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    verifyEmail: (token: string) =>
      this.request('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),

    updateEmail: (data: { new_email: string; password: string }) =>
      this.request('/api/auth/email', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updatePassword: (data: PasswordUpdateData) =>
      this.request<{ message: string }>('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  users = {
    get: (id: number) => this.request(`/api/users/${id}`),

    updateMe: (data: ProfileUpdateData) =>
      this.request('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    list: (params?: URLSearchParams) =>
      this.request(`/api/users/${params ? '?' + params.toString() : ''}`),

    uploadProfileImage: (file: File) => {
      const formData = new FormData();
      formData.append('profile_image', file);

      return this.request<ProfileImageResponse>('/api/users/me/profile-image', {
        method: 'POST',
        body: formData,
      });
    },

    deleteProfileImage: () =>
      this.request<{ message: string }>('/api/users/me/profile-image', {
        method: 'DELETE',
      }),
  };

  events = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/events/${params ? '?' + params.toString() : ''}`),
    get: (id: number) => this.request(`/api/events/${id}`),
    join: (id: number) =>
      this.request(`/api/events/${id}/join`, { method: 'POST' }),
  };

  services = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/services/${params ? '?' + params.toString() : ''}`),
  };

  discussions = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/discussions/${params ? '?' + params.toString() : ''}`),
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
