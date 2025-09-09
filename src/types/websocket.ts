export interface AuthWebSocketMessage {
  type:
    | 'heartbeat'
    | 'heartbeat_ack'
    | 'refresh_token'
    | 'token_refreshed'
    | 'token_refresh_failed'
    | 'token_expiring'
    | 'ping'
    | 'pong';
  token?: string;
  success?: boolean;
  expires_in?: number;
  message?: string;
  timestamp?: number;
}

export interface WebSocketConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastHeartbeat?: number;
  tokenExpiring: boolean;
  tokenExpiresIn?: number;
}

export interface AuthWebSocketConfig {
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
  reconnectBaseDelay?: number;
  tokenRefreshThreshold?: number;
}

export interface WebSocketAuthError {
  type:
    | 'token_expired'
    | 'token_refresh_failed'
    | 'connection_lost'
    | 'heartbeat_timeout';
  message: string;
  canRetry: boolean;
  severity: 'low' | 'medium' | 'high';
}
