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
import type {
  ServiceCreateData,
  ServiceUpdateData,
  ServiceInterestData,
  ServiceCompletionData,
  ServiceInterestResponseData,
  ServiceRatingData,
  ServiceSearchFilters,
} from '@/types/service';
import { useAuthStore } from '@/store/auth';
import { extendApiClientWithAdmin } from './admin-api';

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
  email_notifications_events?: boolean;
  email_notifications_messages?: boolean;
  email_notifications_newsletter?: boolean;
}

interface PasswordUpdateData {
  current_password: string;
  new_password: string;
}

interface ProfileImageResponse {
  profile_image_url: string;
  message: string;
}

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  config: {
    url: string;
    options: RequestInit;
    skipAuth?: boolean;
  };
}

interface EventCreateData {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
  category_id: number;
}

interface CivicEventCreateData {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
}

interface EventUpdateData {
  title?: string;
  description?: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
  category_id?: number;
  is_active?: boolean;
}

export interface PollOption {
  id: number;
  text: string;
  order_index: number;
  vote_count: number;
}

export interface Poll {
  id: number;
  question: string;
  poll_type: 'thread' | 'admin';
  is_active: boolean;
  ends_at?: string;
  created_at: string;
  creator: {
    id: number;
    display_name: string;
    profile_image_url?: string;
  };
  thread?: {
    id: number;
    title: string;
  };
  options: PollOption[];
  total_votes: number;
  user_vote?: number;
}

export interface PollCreateData {
  question: string;
  poll_type: 'thread' | 'admin';
  ends_at?: string;
  thread_id?: number;
  options: Array<{
    text: string;
    order_index: number;
  }>;
}

export interface PollUpdateData {
  question?: string;
  is_active?: boolean;
  ends_at?: string;
}

export interface VoteData {
  option_id: number;
}

export interface VoteResponse {
  id: number;
  created_at: string;
  user: {
    id: number;
    display_name: string;
    profile_image_url?: string;
  };
  poll_id: number;
  option_id: number;
}

export interface PollResults {
  poll_id: number;
  question: string;
  total_votes: number;
  options: Array<{
    option_id: number;
    text: string;
    votes: number;
    percentage: number;
  }>;
  winners: Array<{
    option_id: number;
    text: string;
  }>;
  result_type: 'no_votes' | 'clear_winner' | 'tie' | 'unclear';
  is_concluded: boolean;
  participation_rate: 'no_participation' | 'low' | 'moderate' | 'high';
}

export interface UserVotingStats {
  user_id: number;
  polls_created: number;
  votes_cast: number;
  engagement_level: 'inactive' | 'low' | 'moderate' | 'high';
}

class ApiError extends Error {
  public status: number;
  public detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshInProgress = false;
  private requestQueue: QueuedRequest[] = [];

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

  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token && !skipAuth) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = { ...options, headers };

    try {
      const response = await fetch(url, config);

      if (
        response.status === 401 &&
        !skipAuth &&
        !endpoint.includes('/auth/')
      ) {
        return this.handleUnauthorized<T>(endpoint, options);
      }

      if (!response.ok) {
        let errorDetail: unknown;
        try {
          errorDetail = await response.json();
        } catch {
          errorDetail = { message: `HTTP ${response.status}` };
        }

        const message =
          typeof errorDetail === 'object' &&
          errorDetail !== null &&
          'user_message' in errorDetail
            ? String(errorDetail.user_message)
            : typeof errorDetail === 'object' &&
                errorDetail !== null &&
                'message' in errorDetail
              ? String(errorDetail.message)
              : `HTTP ${response.status}`;

        throw new ApiError(message, response.status, errorDetail);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return this.transformRelativeUrls(data);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('401') ||
          error.message.includes('Unauthorized')) &&
        !skipAuth &&
        !endpoint.includes('/auth/')
      ) {
        return this.handleUnauthorized<T>(endpoint, options);
      }
      throw error;
    }
  }

  private async handleUnauthorized<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    if (this.refreshInProgress) {
      return new Promise<T>((resolve, reject) => {
        this.requestQueue.push({
          resolve: resolve as (value: unknown) => void,
          reject,
          config: {
            url: endpoint,
            options,
          },
        });
      });
    }

    this.refreshInProgress = true;

    try {
      const authStore = useAuthStore.getState();
      const refreshResult = await authStore.refreshToken();

      if (refreshResult.success) {
        this.processQueue();

        return await this.request<T>(endpoint, options);
      } else {
        this.processQueue(new Error('Token refresh failed'));
        throw new Error('Authentication failed');
      }
    } catch (error) {
      this.processQueue(error);
      throw error;
    } finally {
      this.refreshInProgress = false;
    }
  }

  private processQueue(error?: unknown) {
    const queue = this.requestQueue.splice(0);

    queue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        this.request(config.url, config.options).then(resolve).catch(reject);
      }
    });
  }

  private transformRelativeUrls<T>(data: T): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformRelativeUrls(item)) as T;
    }

    const transformed = { ...data } as Record<string, unknown>;

    const urlFields = ['profile_image_url', 'service_image_url'];

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
      this.request<TokenResponse>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        true
      ),

    register: (data: RegisterData) =>
      this.request(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        true
      ),

    me: () => this.request('/api/auth/me'),

    checkAvailability: (data: { email?: string; display_name?: string }) =>
      this.request<{ available: boolean; message?: string }>(
        '/api/auth/check-availability',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        true
      ),

    resendVerification: (data: { email: string }) =>
      this.request<{ message: string }>(
        '/api/auth/resend-verification',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        true
      ),

    verifyEmail: (token: string) =>
      this.request(
        '/api/auth/verify-email',
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        },
        true
      ),

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

    deleteAccount: () =>
      this.request('/api/auth/account', {
        method: 'DELETE',
      }),

    refresh: (data: { refresh_token: string }) =>
      this.request<TokenResponse>(
        '/api/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        true
      ),
  };

  users = {
    get: (id: number) => this.request(`/api/users/${id}`),

    list: (params?: URLSearchParams) =>
      this.request<
        Array<{
          id: number;
          display_name: string;
          first_name: string;
          last_name: string;
          bio: string;
          location: string;
          created_at: string;
          profile_image_url: string;
        }>
      >(`/api/users${params ? '?' + params.toString() : ''}`),

    updateMe: (data: ProfileUpdateData) =>
      this.request('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

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

    create: (data: EventCreateData) =>
      this.request('/api/events/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    createCivic: (data: CivicEventCreateData) =>
      this.request('/api/events/?is_civic=true', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    listCivic: (params?: URLSearchParams) => {
      const civicParams = new URLSearchParams(params);
      civicParams.append('political_only', 'true');
      return this.request(`/api/events?${civicParams.toString()}`);
    },

    listRegular: (params?: URLSearchParams) => {
      const regularParams = new URLSearchParams(params);
      regularParams.append('exclude_political', 'true');
      return this.request(`/api/events?${regularParams.toString()}`);
    },

    getCivicEvents: (params?: URLSearchParams) =>
      this.request(`/api/events/civic${params ? '?' + params.toString() : ''}`),

    getRegularEvents: (params?: URLSearchParams) =>
      this.request(
        `/api/events/regular${params ? '?' + params.toString() : ''}`
      ),

    update: (id: number, data: EventUpdateData) =>
      this.request(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      this.request(`/api/events/${id}`, {
        method: 'DELETE',
      }),

    join: (id: number) =>
      this.request(`/api/events/${id}/join`, {
        method: 'POST',
      }),

    leave: (id: number) =>
      this.request(`/api/events/${id}/join`, {
        method: 'DELETE',
      }),

    getParticipants: (id: number) =>
      this.request(`/api/events/${id}/participants`),

    getMyCreated: (params?: URLSearchParams) =>
      this.request(
        `/api/events/my/created${params ? '?' + params.toString() : ''}`
      ),

    getMyJoined: (params?: URLSearchParams) =>
      this.request(
        `/api/events/my/joined${params ? '?' + params.toString() : ''}`
      ),

    getMyStats: () => this.request('/api/events/my/stats'),
  };

  eventCategories = {
    list: (params?: URLSearchParams) =>
      this.request(
        `/api/event-categories/${params ? '?' + params.toString() : ''}`
      ),

    get: (id: number) => this.request(`/api/event-categories/${id}`),
  };

  services = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/services/${params ? '?' + params.toString() : ''}`),

    get: (id: number) => this.request(`/api/services/${id}`),

    create: (data: ServiceCreateData) =>
      this.request('/api/services/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    createWithImage: (formData: FormData) =>
      this.request('/api/services/with-image', {
        method: 'POST',
        body: formData,
        headers: {},
      }),

    update: (id: number, data: ServiceUpdateData) =>
      this.request(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateWithImage: (id: number, formData: FormData) =>
      this.request(`/api/services/${id}/with-image`, {
        method: 'PUT',
        body: formData,
      }),

    delete: (id: number) =>
      this.request(`/api/services/${id}`, {
        method: 'DELETE',
      }),

    deleteImage: (id: number) =>
      this.request(`/api/services/${id}/image`, {
        method: 'DELETE',
      }),

    getMyServices: (params?: URLSearchParams) =>
      this.request(`/api/services/my/${params ? '?' + params.toString() : ''}`),

    getMyStats: () => this.request('/api/services/my/stats'),

    getStats: () => this.request('/api/services/stats'),

    getDetailedStats: () => this.request('/api/services/stats/detailed'),

    getRecommendations: (params?: URLSearchParams) =>
      this.request(
        `/api/services/recommendations${params ? '?' + params.toString() : ''}`
      ),

    expressInterest: (
      serviceId: number,
      message?: string
    ): Promise<{
      message: string;
      new_interest_count: number;
    }> =>
      this.request(`/api/services/${serviceId}/interest`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),

    expressInterestWithMessage: (
      serviceId: number,
      data: ServiceInterestData
    ) => {
      const formData = new FormData();
      formData.append('message', data.message);
      if (data.proposed_meeting_location) {
        formData.append(
          'proposed_meeting_location',
          data.proposed_meeting_location
        );
      }
      if (data.proposed_meeting_time) {
        formData.append(
          'proposed_meeting_time',
          data.proposed_meeting_time.toISOString()
        );
      }

      return this.request(`/api/services/${serviceId}/interest/message`, {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },

    getServiceInterests: (serviceId: number) =>
      this.request(`/api/services/${serviceId}/interests`),

    getMyInterests: (params?: URLSearchParams) =>
      this.request(
        `/api/services/interests/my${params ? '?' + params.toString() : ''}`
      ),

    respondToInterest: (
      interestId: number,
      data: ServiceInterestResponseData
    ) =>
      this.request(`/api/services/interests/${interestId}/respond`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    completeService: (serviceId: number, data: ServiceCompletionData) =>
      this.request(`/api/services/${serviceId}/complete`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    rateService: (serviceId: number, data: ServiceRatingData) =>
      this.request(`/api/services/${serviceId}/rate`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getServiceRatings: (serviceId: number) =>
      this.request(`/api/services/${serviceId}/ratings`),

    search: (filters: ServiceSearchFilters) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      return this.request(`/api/services/search?${params.toString()}`);
    },

    getServiceAnalytics: (serviceId: number) =>
      this.request(`/api/services/${serviceId}/analytics`),

    incrementViewCount: (serviceId: number) =>
      this.request(`/api/services/${serviceId}/view`, {
        method: 'POST',
      }),
  };

  discussions = {
    list: (params?: URLSearchParams) =>
      this.request(`/api/discussions/${params ? '?' + params.toString() : ''}`),
  };

  polls = {
    list: (params?: URLSearchParams) =>
      this.request<Poll[]>(
        `/api/polls${params ? '?' + params.toString() : ''}`
      ),

    get: (id: number, include_analysis = false) => {
      const params = new URLSearchParams();
      if (include_analysis) params.append('include_analysis', 'true');
      return this.request<Poll>(
        `/api/polls/${id}${params.toString() ? '?' + params.toString() : ''}`
      );
    },

    create: (data: PollCreateData, auto_suggest_duration = false) => {
      const params = new URLSearchParams();
      if (auto_suggest_duration) params.append('auto_suggest_duration', 'true');
      return this.request<Poll>(
        `/api/polls${params.toString() ? '?' + params.toString() : ''}`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    update: (id: number, data: PollUpdateData) =>
      this.request<Poll>(`/api/polls/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      this.request(`/api/polls/${id}`, {
        method: 'DELETE',
      }),

    vote: (id: number, data: VoteData) =>
      this.request<VoteResponse>(`/api/polls/${id}/vote`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    removeVote: (id: number) =>
      this.request(`/api/polls/${id}/vote`, {
        method: 'DELETE',
      }),

    getMyPolls: (params?: URLSearchParams) =>
      this.request<Poll[]>(
        `/api/polls/my/created${params ? '?' + params.toString() : ''}`
      ),

    getMyVotes: (params?: URLSearchParams) =>
      this.request<VoteResponse[]>(
        `/api/polls/my/votes${params ? '?' + params.toString() : ''}`
      ),

    getMyStats: () => this.request<UserVotingStats>('/api/polls/my/stats'),

    getResults: (id: number, detailed = false) => {
      const params = new URLSearchParams();
      if (detailed) params.append('detailed', 'true');
      return this.request<PollResults>(
        `/api/polls/${id}/results${params.toString() ? '?' + params.toString() : ''}`
      );
    },
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

      console.log('Marking as read:', { conversationId, upToMessageId });

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

export const apiClient = extendApiClientWithAdmin(new ApiClient(API_BASE_URL));
