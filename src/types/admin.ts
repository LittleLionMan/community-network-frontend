export interface AdminDashboardStats {
  platform_stats: {
    total_users: number;
    total_events: number;
    total_services: number;
    total_comments: number;
    total_forum_posts: number;
    total_polls: number;
    total_votes: number;
    total_messages: number;
    total_conversations: number;
    active_conversations: number;
    flagged_messages: number;
    active_refresh_tokens: number;
    total_refresh_tokens: number;
    recent_activity: {
      new_users_7d: number;
      new_events_7d: number;
      new_services_7d: number;
    };
    rate_limiting: {
      health_score: number;
      status: string;
      active_users: number;
      total_lockouts: number;
      monitoring_enabled: boolean;
    };
    error?: string;
  };
  websocket_stats: {
    active_connections: number;
    total_connections: number;
    message_queues: number;
  };
  health: {
    database: string;
    moderation: string;
    matching: string;
    messaging: string;
    websockets: string;
    token_rotation: string;
    structured_logging: boolean;
    rate_limiting: boolean;
    failed_login_protection: boolean;
    request_monitoring: boolean;
  };
  settings: {
    debug_mode: boolean;
    content_moderation_enabled: boolean;
    moderation_threshold: number;
    service_matching_enabled: boolean;
    event_auto_attendance: boolean;
    message_system_enabled: boolean;
    refresh_token_rotation: boolean;
    structured_logging: boolean;
  };
}

export interface RateLimitHealth {
  health_score: number;
  status: 'excellent' | 'good' | 'warning' | 'poor' | 'critical';
  content_rate_limits: {
    active_users: number;
    total_lockouts: number;
    lockouts_by_type: Record<string, number>;
    burst_lockouts_1h: number;
    daily_limit_hits_1h: number;
    top_limited_content_types: Record<string, number>;
    user_tier_distribution: {
      new: number;
      regular: number;
      established: number;
      trusted: number;
    };
  };
  read_rate_limits: {
    active_ips: number;
    blocked_reads_1h: number;
    top_limited_endpoints: Record<string, number>;
    suspicious_ips: Array<{
      ip: string;
      attempts_1h: number;
      endpoints: string[];
    }>;
  };
  alerts: Array<{
    alert_type: string;
    severity: string;
    message: string;
    details: Record<string, unknown>;
    timestamp: string;
    resolved: boolean;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
  }>;
  timestamp: string;
}

export interface RateLimitOverview {
  content_rate_limits: {
    active_users: number;
    active_lockouts: number;
    total_tracked_users: number;
  };
  read_rate_limits: {
    active_ips: number;
    total_tracked_ips: number;
  };
  rate_limit_config: {
    content_types: string[];
    user_tiers: string[];
  };
}

export interface UserRateLimitStats {
  user_id: number;
  content_usage: Record<string, Array<[number, number]>>;
  active_lockouts: Record<string, number>;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  display_name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  email_verified: boolean;
  profile_image_url?: string | null;
  last_login?: string;
}

export interface UserSearchParams {
  search?: string;
  is_active?: boolean;
  is_admin?: boolean;
  email_verified?: boolean;
  page?: number;
  size?: number;
}

export interface UserSearchResponse {
  users: AdminUser[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface FlaggedContent {
  id: number;
  content_type: 'comment' | 'forum_post' | 'message';
  content_id: number;
  content_text: string;
  author: {
    id: number;
    display_name: string;
    email: string;
  };
  flagged_by: {
    id: number;
    display_name: string;
  };
  flag_reason: string;
  created_at: string;
  flagged_at: string;
  status: 'pending' | 'reviewed' | 'approved' | 'removed';
  severity: 'low' | 'medium' | 'high';
}

export interface ModerationQueueResponse {
  content: FlaggedContent[];
  total: number;
  page: number;
  size: number;
  pending_count: number;
  high_priority_count: number;
}

export interface SecurityEvent {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  event_type: string;
  message: string;
  user_id?: number;
  ip_address?: string;
  details?: Record<string, unknown>;
}

export interface SecuritySummary {
  time_range: string;
  overview: {
    structured_logging: string;
    rate_limiting: string;
    security_middleware: string;
    suspicious_request_detection: string;
  };
  security_health: {
    status: string;
    structured_logging: boolean;
    rate_limiting: boolean;
  };
}

export interface AdminAction {
  action: string;
  target_user_id?: number;
  details?: Record<string, unknown>;
  success?: boolean;
  error?: string;
}
