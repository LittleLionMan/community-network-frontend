import type {
  Conversation,
  ConversationDetail,
  ConversationListResponse,
  CreateConversationData,
  CreateMessageData,
  UpdateMessageData,
  Message,
  MessageListResponse,
  ConversationSettings,
  MessagePrivacySettings,
  UnreadCount,
} from '@/types/message';

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

    const data = await response.json();

    return this.transformRelativeUrls(data);
  }

  private transformRelativeUrls<T>(data: T): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformRelativeUrls(item)) as T;
    }

    const transformed = { ...data } as Record<string, unknown>;

    const urlFields = [
      'profile_image_url',
      // Add more URL fields as needed
    ];

    for (const field of urlFields) {
      if (field in transformed && typeof transformed[field] === 'string') {
        transformed[field] = this.makeAbsoluteUrl(transformed[field] as string);
      }
    }

    for (const key in transformed) {
      if (transformed[key] && typeof transformed[key] === 'object') {
        transformed[key] = this.transformRelativeUrls(transformed[key]);
      }
    }

    return transformed as T;
  }

  private makeAbsoluteUrl(url: string): string {
    if (!url) return url;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${this.baseURL}${url}`;
    }

    return `${this.baseURL}/${url}`;
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
  messages = {
    createConversation: (data: CreateConversationData) =>
      this.request<Conversation>('/api/messages/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getConversations: (page?: number, size?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (size) params.append('size', size.toString());
      return this.request<ConversationListResponse>(
        `/api/messages/conversations${params.toString() ? '?' + params.toString() : ''}`
      );
    },

    getConversation: (conversationId: number) =>
      this.request<ConversationDetail>(
        `/api/messages/conversations/${conversationId}`
      ),

    updateConversationSettings: (
      conversationId: number,
      settings: ConversationSettings
    ) =>
      this.request(`/api/messages/conversations/${conversationId}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),

    sendMessage: (conversationId: number, data: CreateMessageData) =>
      this.request<Message>(
        `/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),

    getMessages: (
      conversationId: number,
      page?: number,
      size?: number,
      beforeMessageId?: number
    ) => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (size) params.append('size', size.toString());
      if (beforeMessageId)
        params.append('before_message_id', beforeMessageId.toString());

      return this.request<MessageListResponse>(
        `/api/messages/conversations/${conversationId}/messages${params.toString() ? '?' + params.toString() : ''}`
      );
    },

    editMessage: (messageId: number, data: UpdateMessageData) =>
      this.request<Message>(`/api/messages/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteMessage: (messageId: number) =>
      this.request(`/api/messages/messages/${messageId}`, {
        method: 'DELETE',
      }),

    markMessagesAsRead: (conversationId: number, upToMessageId?: number) => {
      const params = new URLSearchParams();
      if (upToMessageId)
        params.append('up_to_message_id', upToMessageId.toString());

      return this.request(
        `/api/messages/conversations/${conversationId}/read`,
        {
          method: 'POST',
          body: params.toString()
            ? JSON.stringify({ up_to_message_id: upToMessageId })
            : '{}',
        }
      );
    },

    getUnreadCount: () =>
      this.request<UnreadCount>('/api/messages/unread-count'),

    checkCanMessageUser: (userId: number) =>
      this.request<{ can_message: boolean; reason?: string }>(
        `/api/messages/check-can-message/${userId}`
      ),

    getPrivacySettings: () =>
      this.request<MessagePrivacySettings>('/api/messages/privacy-settings'),

    updatePrivacySettings: (settings: MessagePrivacySettings) =>
      this.request('/api/messages/privacy-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
  };

  createWebSocket = (endpoint: string, token?: string): WebSocket => {
    const wsUrl = this.baseURL.replace('http', 'ws');
    const url = token
      ? `${wsUrl}${endpoint}?token=${encodeURIComponent(token)}`
      : `${wsUrl}${endpoint}`;

    return new WebSocket(url);
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
