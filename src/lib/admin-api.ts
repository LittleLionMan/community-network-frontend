import type {
  AdminDashboardStats,
  RateLimitHealth,
  RateLimitOverview,
  UserRateLimitStats,
  AdminUser,
  UserSearchParams,
  UserSearchResponse,
  ModerationQueueResponse,
  SecuritySummary,
} from '@/types/admin';

interface EventCategoryCreateData {
  name: string;
  description?: string;
}

interface EventCategoryWithStats {
  id: number;
  name: string;
  description?: string;
  event_count: number;
  created_at: string;
  can_delete: boolean;
}

interface AdminMethods {
  admin: {
    getDashboard: () => Promise<AdminDashboardStats>;

    getSecurityEvents: (params?: {
      limit?: number;
      hours?: number;
      event_type?: string;
      level?: string;
    }) => Promise<{
      message: string;
      info: string;
      filters: Record<string, unknown>;
      note: string;
    }>;

    getSecuritySummary: (hours?: number) => Promise<SecuritySummary>;

    getSecurityStats: (hours?: number) => Promise<SecuritySummary>;

    testSecurityLogging: () => Promise<{
      message: string;
      admin_user: string;
      timestamp: string;
      note: string;
    }>;

    getRateLimitHealth: () => Promise<{
      health: RateLimitHealth;
      recent_alerts: Array<Record<string, unknown>>;
      monitoring_active: boolean;
      last_check: string;
    }>;

    getRateLimitOverview: () => Promise<RateLimitOverview>;

    getUserRateLimitStats: (userId: number) => Promise<UserRateLimitStats>;

    clearUserRateLimits: (
      userId: number,
      contentType?: string
    ) => Promise<{
      message: string;
      content_type: string;
      admin_user: string;
    }>;

    getRateLimitStatus: () => Promise<{
      rate_limiting: {
        enabled: boolean;
        type: string;
        limits: Record<string, string>;
      };
      note: string;
    }>;

    clearRateLimits: (ipAddress?: string) => Promise<{
      message: string;
      admin_user: string;
      timestamp: string;
    }>;

    getUsers: (params?: UserSearchParams) => Promise<UserSearchResponse>;

    getUser: (userId: number) => Promise<AdminUser>;

    deactivateUser: (
      userId: number,
      reason?: string
    ) => Promise<{
      message: string;
      user_id: number;
      admin_user: string;
    }>;

    activateUser: (userId: number) => Promise<{
      message: string;
      user_id: number;
      admin_user: string;
    }>;

    updateAdminStatus: (
      userId: number,
      isAdmin: boolean
    ) => Promise<{
      message: string;
      user_id: number;
      is_admin: boolean;
      admin_user: string;
    }>;

    getFlaggedContent: (params?: {
      page?: number;
      size?: number;
      status?: string;
      severity?: string;
    }) => Promise<ModerationQueueResponse>;

    moderateContent: (
      contentId: number,
      action: 'approve' | 'remove',
      reason?: string
    ) => Promise<{
      message: string;
      action: string;
      content_id: number;
    }>;

    triggerTokenMaintenance: () => Promise<{
      status: string;
      message: string;
    }>;

    processCompletedEvents: () => Promise<{
      message: string;
      events_processed: number;
    }>;

    cleanupMessageSystem: () => Promise<{
      message: string;
      old_messages_removed: number;
      empty_conversations_removed: number;
    }>;

    eventCategories: {
      list: () => Promise<EventCategoryWithStats[]>;
      create: (
        data: EventCategoryCreateData
      ) => Promise<EventCategoryWithStats>;
      update: (
        id: number,
        data: EventCategoryCreateData
      ) => Promise<EventCategoryWithStats>;
      delete: (id: number) => Promise<{ message: string }>;
      createDefaults: () => Promise<{
        message: string;
        categories_created: number;
        categories: EventCategoryWithStats[];
      }>;
    };

    triggerCleanup: () => Promise<{
      message: string;
    }>;

    getSecurityOverview: () => Promise<{
      security_system: string;
      status: string;
      features: Record<string, boolean>;
      note: string;
      recommendation: string;
    }>;
  };
}

export function extendApiClientWithAdmin<
  T extends {
    request: <U>(
      endpoint: string,
      options?: RequestInit,
      skipAuth?: boolean
    ) => Promise<U>;
  },
>(apiClient: T): T & AdminMethods {
  const extendedClient = apiClient as T & AdminMethods;

  extendedClient.admin = {
    getDashboard: () =>
      apiClient.request<AdminDashboardStats>('/api/admin/dashboard'),

    getSecurityEvents: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
      return apiClient.request(
        `/api/admin/security/events${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      );
    },

    getSecuritySummary: (hours = 24) =>
      apiClient.request(`/api/admin/security/events/summary?hours=${hours}`),

    getSecurityStats: (hours = 24) =>
      apiClient.request(`/api/admin/security/stats?hours=${hours}`),

    testSecurityLogging: () =>
      apiClient.request('/api/admin/security/test-logging', { method: 'POST' }),

    getRateLimitHealth: () =>
      apiClient.request('/api/admin/rate-limiting/health'),

    getRateLimitOverview: () =>
      apiClient.request<RateLimitOverview>('/api/admin/rate-limits/overview'),

    getUserRateLimitStats: (userId: number) =>
      apiClient.request<UserRateLimitStats>(
        `/api/admin/rate-limits/user/${userId}/stats`
      ),

    clearUserRateLimits: (userId: number, contentType?: string) => {
      const params = contentType ? `?content_type=${contentType}` : '';
      return apiClient.request(
        `/api/admin/rate-limits/user/${userId}/clear${params}`,
        {
          method: 'POST',
        }
      );
    },

    getRateLimitStatus: () =>
      apiClient.request('/api/admin/security/rate-limit-status'),

    clearRateLimits: (ipAddress?: string) => {
      const params = ipAddress ? `?ip_address=${ipAddress}` : '';
      return apiClient.request(
        `/api/admin/security/clear-rate-limits${params}`,
        {
          method: 'POST',
        }
      );
    },

    getUsers: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
      return apiClient.request<UserSearchResponse>(
        `/api/users/admin-list${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      );
    },

    getUser: (userId: number) =>
      apiClient.request<AdminUser>(`/api/users/${userId}`),

    deactivateUser: (userId: number, reason?: string) => {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      return apiClient.request(
        `/api/users/${userId}/admin/deactivate${params}`,
        { method: 'POST' }
      );
    },

    activateUser: (userId: number) =>
      apiClient.request(`/api/users/${userId}/admin/activate`, {
        method: 'POST',
      }),

    updateAdminStatus: (userId: number, isAdmin: boolean) => {
      const params = `?is_admin=${isAdmin}`;
      return apiClient.request(
        `/api/users/${userId}/admin/admin-status${params}`,
        { method: 'PUT' }
      );
    },

    getFlaggedContent: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
      return apiClient.request<ModerationQueueResponse>(
        `/api/discussions/admin/flagged-content${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      );
    },

    moderateContent: (
      contentId: number,
      action: 'approve' | 'remove',
      reason?: string
    ) =>
      apiClient.request(`/api/comments/admin/moderate/${contentId}`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      }),

    triggerTokenMaintenance: () =>
      apiClient.request('/api/admin/maintenance/tokens', { method: 'POST' }),

    processCompletedEvents: () =>
      apiClient.request('/api/admin/tasks/process-events', { method: 'POST' }),

    cleanupMessageSystem: () =>
      apiClient.request('/api/admin/tasks/cleanup-messages', {
        method: 'POST',
      }),

    triggerCleanup: () =>
      apiClient.request('/api/admin/tasks/trigger-cleanup', { method: 'POST' }),

    getSecurityOverview: () =>
      apiClient.request('/api/admin/security-overview'),

    eventCategories: {
      list: () =>
        apiClient.request<EventCategoryWithStats[]>(
          '/api/event-categories/admin'
        ),

      create: (data: EventCategoryCreateData) =>
        apiClient.request<EventCategoryWithStats>(
          '/api/event-categories/admin',
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        ),

      update: (id: number, data: EventCategoryCreateData) =>
        apiClient.request<EventCategoryWithStats>(
          `/api/event-categories/admin/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        ),

      delete: (id: number) =>
        apiClient.request<{ message: string }>(
          `/api/event-categories/admin/${id}`,
          {
            method: 'DELETE',
          }
        ),

      createDefaults: () =>
        apiClient.request('/api/event-categories/admin/create-defaults', {
          method: 'POST',
        }),
    },
  };

  return extendedClient;
}
