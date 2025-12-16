import {
  WebSocketConnectionState,
  AuthWebSocketMessage,
  AuthWebSocketConfig,
  WebSocketAuthError,
} from '@/types/websocket';
import { useAuthStore } from '@/store/auth';

function hasUnderlyingError(e: Event): e is Event & { error: unknown } {
  return 'error' in e;
}

type SendableWebSocketData = Record<string, unknown> | AuthWebSocketMessage;

export class AuthenticatedWebSocket extends EventTarget {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private config: Required<AuthWebSocketConfig>;

  private state: WebSocketConnectionState = {
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    tokenExpiring: false,
  };

  private url: string;
  private currentToken: string | null = null;
  private isManuallyDisconnected = false;

  constructor(url: string, config: AuthWebSocketConfig = {}) {
    super();
    this.url = url;
    this.config = {
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectBaseDelay: config.reconnectBaseDelay ?? 1000,
      tokenRefreshThreshold: config.tokenRefreshThreshold ?? 300000,
    };
  }

  public connect(token: string): void {
    if (this.isManuallyDisconnected) {
      this.isManuallyDisconnected = false;
    }

    this.currentToken = token;
    this.cleanup();
    this.createConnection();
  }

  public disconnect(): void {
    this.isManuallyDisconnected = true;
    this.cleanup();
    this.setState({
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0,
      tokenExpiring: false,
    });
  }

  public send(data: SendableWebSocketData): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  public getState(): WebSocketConnectionState {
    return { ...this.state };
  }

  public refreshToken(newToken: string): void {
    this.currentToken = newToken;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendAuthMessage({
        type: 'refresh_token',
        token: newToken,
      });
    }
  }

  private createConnection(): void {
    if (!this.currentToken || this.isManuallyDisconnected) {
      return;
    }

    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(this.currentToken)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    this.setState({
      isConnected: true,
      isReconnecting: false,
      reconnectAttempts: 0,
      lastHeartbeat: Date.now(),
    });

    this.startHeartbeat();
    this.dispatchEvent(new CustomEvent('connected'));
  }

  private handleClose(event: CloseEvent): void {
    this.setState({
      isConnected: false,
      lastHeartbeat: undefined,
    });

    this.stopHeartbeat();

    if (event.code === 4001) {
      this.handleAuthError({
        type: 'token_expired',
        message: 'Authentication token expired',
        canRetry: true,
        severity: 'medium',
      });
    } else if (event.code === 4002) {
      this.handleAuthError({
        type: 'token_expired',
        message: 'User account is inactive',
        canRetry: false,
        severity: 'high',
      });
    } else if (
      !this.isManuallyDisconnected &&
      this.state.reconnectAttempts < this.config.maxReconnectAttempts
    ) {
      this.scheduleReconnect();
    }

    this.dispatchEvent(new CustomEvent('disconnected', { detail: event }));
  }

  private handleError(event: Event): void {
    console.group('🚨 WebSocket error');

    console.error('Event:', event);

    let underlyingError: unknown = 'None';
    if (hasUnderlyingError(event)) {
      underlyingError = event.error;
    }

    console.error('Underlying error:', underlyingError);

    if (event.target instanceof WebSocket) {
      console.error('WebSocket readyState:', event.target.readyState);
    }

    console.groupEnd();

    this.setState({ isConnected: false });

    this.handleAuthError({
      type: 'connection_lost',
      message: 'Connection error occurred',
      canRetry: true,
      severity: 'medium',
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);

      if (this.isAuthMessage(message)) {
        this.handleAuthMessage(message);
      } else {
        this.dispatchEvent(new CustomEvent('message', { detail: message }));
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private isAuthMessage(message: unknown): message is AuthWebSocketMessage {
    if (!message || typeof message !== 'object' || message === null) {
      return false;
    }

    const msg = message as Record<string, unknown>;

    if (!('type' in msg) || typeof msg.type !== 'string') {
      return false;
    }

    const authTypes = [
      'heartbeat',
      'heartbeat_ack',
      'refresh_token',
      'token_refreshed',
      'token_refresh_failed',
      'token_expiring',
      'ping',
      'pong',
    ];

    return authTypes.includes(msg.type);
  }

  private handleAuthMessage(message: AuthWebSocketMessage): void {
    switch (message.type) {
      case 'heartbeat_ack':
        this.setState({ lastHeartbeat: Date.now() });
        break;

      case 'token_expiring':
        console.warn('🔔 Token expiring soon:', message.expires_in);
        this.setState({
          tokenExpiring: true,
          tokenExpiresIn: message.expires_in,
        });
        this.handleTokenExpiring();
        break;

      case 'token_refreshed':
        this.setState({ tokenExpiring: false });
        break;

      case 'token_refresh_failed':
        console.error('❌ Token refresh failed');
        this.handleAuthError({
          type: 'token_refresh_failed',
          message: 'Failed to refresh authentication token',
          canRetry: true,
          severity: 'high',
        });
        break;

      case 'pong':
        break;

      default:
    }
  }

  private sendAuthMessage(message: AuthWebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendAuthMessage({ type: 'heartbeat' });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (
      this.isManuallyDisconnected ||
      this.state.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      return;
    }

    this.setState({
      isReconnecting: true,
      reconnectAttempts: this.state.reconnectAttempts + 1,
    });

    const delay = Math.min(
      this.config.reconnectBaseDelay *
        Math.pow(2, this.state.reconnectAttempts - 1),
      30000
    );

    this.reconnectTimeout = setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  private async handleTokenExpiring(): Promise<void> {
    try {
      const authStore = useAuthStore.getState();
      const refreshed = await authStore.refreshToken();

      if (refreshed) {
      } else {
        throw new Error('Token refresh returned no token');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.handleAuthError({
        type: 'token_refresh_failed',
        message: 'Could not refresh authentication token',
        canRetry: true,
        severity: 'high',
      });
    }
  }

  private handleAuthError(error: WebSocketAuthError): void {
    console.error('🚨 WebSocket Auth Error:', error);
    this.dispatchEvent(new CustomEvent('auth-error', { detail: error }));
  }

  private setState(updates: Partial<WebSocketConnectionState>): void {
    this.state = { ...this.state, ...updates };
    this.dispatchEvent(new CustomEvent('state-change', { detail: this.state }));
  }

  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Manual disconnect');
      }

      this.ws = null;
    }
  }

  public destroy(): void {
    this.isManuallyDisconnected = true;
    this.cleanup();
    this.removeAllEventListeners();
  }

  private removeAllEventListeners(): void {
    // Remove all event listeners to prevent memory leaks
    const events = [
      'connected',
      'disconnected',
      'message',
      'auth-error',
      'state-change',
    ];
    events.forEach((event) => {
      this.removeEventListener(event, () => {});
    });
  }
}
