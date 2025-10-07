'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { AuthenticatedWebSocket } from '@/lib/websocket/AuthenticatedWebSocket';
import type { WebSocketMessage, MessageUser } from '@/types/message';
import type {
  WebSocketConnectionState,
  WebSocketAuthError,
} from '@/types/websocket';

interface WebSocketState extends WebSocketConnectionState {
  typingState: TypingState;
  authError?: WebSocketAuthError;
}

interface TypingState {
  [conversationId: number]: MessageUser[];
}

interface WebSocketManagerReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  tokenExpiring: boolean;
  authError?: WebSocketAuthError;

  typingUsers: MessageUser[];
  startTyping: (conversationId: number) => void;
  stopTyping: (conversationId: number) => void;

  reconnect: () => void;
  disconnect: () => void;
  clearAuthError: () => void;
  retryAuth: () => Promise<void>;
}

class EnhancedUserWebSocketManager {
  private static instance: EnhancedUserWebSocketManager | null = null;
  private userWs: AuthenticatedWebSocket | null = null;
  private conversationWs: AuthenticatedWebSocket | null = null;
  private typingTimeouts: Map<number, NodeJS.Timeout> = new Map();

  private currentConversationId: number | null = null;
  private currentUserId: number | null = null;

  private state: WebSocketState = {
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    tokenExpiring: false,
    typingState: {},
  };

  private subscribers: Set<(state: WebSocketState) => void> = new Set();

  static getInstance(): EnhancedUserWebSocketManager {
    if (!EnhancedUserWebSocketManager.instance) {
      EnhancedUserWebSocketManager.instance =
        new EnhancedUserWebSocketManager();
    }
    return EnhancedUserWebSocketManager.instance;
  }

  subscribe(callback: (state: WebSocketState) => void) {
    this.subscribers.add(callback);
    callback(this.state);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    const currentState = { ...this.state };
    this.subscribers.forEach((callback) => callback(currentState));
  }

  connect(token: string, userId: number) {
    if (
      this.currentUserId === userId &&
      this.userWs &&
      this.state.isConnected
    ) {
      return;
    }

    if (this.currentUserId !== userId) {
      this.cleanup();
    }

    this.currentUserId = userId;
    this.connectUserWebSocket(token, userId);
  }

  private connectUserWebSocket(token: string, userId: number) {
    if (this.userWs) {
      this.userWs.disconnect();
      this.userWs = null;
    }

    try {
      const wsUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ||
        'ws://localhost:8000';
      this.userWs = new AuthenticatedWebSocket(`${wsUrl}/api/messages/ws/user`);

      this.userWs.addEventListener('connected', () => {
        this.updateState({
          isConnected: true,
          isReconnecting: false,
          reconnectAttempts: 0,
          authError: undefined,
        });
      });

      this.userWs.addEventListener('disconnected', () => {
        this.updateState({ isConnected: false });
      });

      this.userWs.addEventListener('state-change', (event: Event) => {
        const customEvent = event as CustomEvent<WebSocketConnectionState>;
        const authState = customEvent.detail;
        this.updateState({
          isConnected: authState.isConnected,
          isReconnecting: authState.isReconnecting,
          reconnectAttempts: authState.reconnectAttempts,
          tokenExpiring: authState.tokenExpiring,
        });
      });

      this.userWs.addEventListener('auth-error', (event: Event) => {
        const customEvent = event as CustomEvent<WebSocketAuthError>;
        const authError = customEvent.detail;
        this.updateState({ authError });
      });

      this.userWs.addEventListener('message', (event: Event) => {
        const customEvent = event as CustomEvent<WebSocketMessage>;
        const message = customEvent.detail;
        this.handleMessage(message, userId);
      });

      this.userWs.connect(token);
    } catch (err) {
      console.error('💥 Failed to create user WebSocket:', err);
      this.updateState({
        isConnected: false,
        authError: {
          type: 'connection_lost',
          message: 'Failed to create WebSocket connection',
          canRetry: true,
          severity: 'medium',
        },
      });
    }
  }

  connectToConversation(conversationId: number, token: string, userId: number) {
    if (
      this.currentConversationId === conversationId &&
      this.conversationWs &&
      this.conversationWs.getState().isConnected
    ) {
      return;
    }

    if (this.conversationWs) {
      this.conversationWs.disconnect();
      this.conversationWs = null;
    }

    this.currentConversationId = conversationId;

    try {
      const wsUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ||
        'ws://localhost:8000';
      this.conversationWs = new AuthenticatedWebSocket(
        `${wsUrl}/api/messages/ws/conversations/${conversationId}`
      );

      this.conversationWs.addEventListener('message', (event: Event) => {
        const customEvent = event as CustomEvent<WebSocketMessage>;
        const message = customEvent.detail;
        this.handleMessage(message, userId);
      });

      this.conversationWs.addEventListener('disconnected', () => {
        if (this.currentConversationId === conversationId) {
          this.currentConversationId = null;
        }
      });

      this.conversationWs.connect(token);
    } catch (err) {
      console.error('💥 Failed to create conversation WebSocket:', err);
    }
  }

  private handleMessage(message: WebSocketMessage, currentUserId: number) {
    window.dispatchEvent(
      new CustomEvent('global-websocket-message', { detail: message })
    );

    if (
      message.type === 'forum_reply' ||
      message.type === 'forum_mention' ||
      message.type === 'forum_quote'
    ) {
      window.dispatchEvent(
        new CustomEvent('forum-notification', { detail: message })
      );
    }

    if (
      message.type === 'typing_status' &&
      message.conversation_id &&
      message.typing_users
    ) {
      const conversationId = message.conversation_id;
      const typingUserObjects = message.typing_users
        .filter((id) => id !== currentUserId)
        .map((id) => ({ id, display_name: `User ${id}` }));

      this.updateTypingState(conversationId, typingUserObjects);
    }
  }

  private updateTypingState(
    conversationId: number,
    typingUsers: MessageUser[]
  ) {
    this.state.typingState[conversationId] = typingUsers;
    this.notifySubscribers();
  }

  sendTyping(conversationId: number, isTyping: boolean) {
    if (this.conversationWs && this.currentConversationId === conversationId) {
      this.conversationWs.send({
        type: 'typing',
        is_typing: isTyping,
      });
    }
  }

  startTyping(conversationId: number) {
    this.sendTyping(conversationId, true);

    const existingTimeout = this.typingTimeouts.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      this.sendTyping(conversationId, false);
      this.typingTimeouts.delete(conversationId);
    }, 3000);

    this.typingTimeouts.set(conversationId, timeout);
  }

  stopTyping(conversationId: number) {
    this.sendTyping(conversationId, false);

    const timeout = this.typingTimeouts.get(conversationId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(conversationId);
    }
  }

  reconnect() {
    const token = localStorage.getItem('auth_token');
    if (token && this.currentUserId) {
      this.connect(token, this.currentUserId);
    }
  }

  disconnect() {
    this.cleanup();
    this.currentUserId = null;
    this.updateState({
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0,
      tokenExpiring: false,
      typingState: {},
      authError: undefined,
    });
  }

  clearAuthError() {
    this.updateState({ authError: undefined });
  }

  async retryAuth(): Promise<void> {
    try {
      const authStore = useAuthStore.getState();
      const refreshResult = await authStore.refreshToken();

      if (refreshResult.success && refreshResult.token) {
        if (this.userWs) {
          this.userWs.refreshToken(refreshResult.token);
        }
        if (this.conversationWs) {
          this.conversationWs.refreshToken(refreshResult.token);
        }

        this.clearAuthError();
      } else {
        throw new Error(refreshResult.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Auth retry failed:', error);
    }
  }

  private updateState(updates: Partial<WebSocketState>) {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  private cleanup() {
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();

    if (this.userWs) {
      this.userWs.destroy();
      this.userWs = null;
    }

    if (this.conversationWs) {
      this.conversationWs.destroy();
      this.conversationWs = null;
    }

    this.currentConversationId = null;
  }

  static cleanup() {
    if (EnhancedUserWebSocketManager.instance) {
      EnhancedUserWebSocketManager.instance.cleanup();
      EnhancedUserWebSocketManager.instance = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    EnhancedUserWebSocketManager.cleanup();
  });
}

export function useUserWebSocket(
  activeConversationId?: number | null
): WebSocketManagerReturn {
  const { user } = useAuthStore();
  const [wsState, setWsState] = useState<WebSocketState>({
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    tokenExpiring: false,
    typingState: {},
  });

  const managerRef = useRef<EnhancedUserWebSocketManager | null>(null);
  const previousConversationIdRef = useRef<number | null>(null);
  const previousUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    managerRef.current = EnhancedUserWebSocketManager.getInstance();
    const unsubscribe = managerRef.current.subscribe(setWsState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    if (user && user.id !== previousUserIdRef.current) {
      const connectWithDelay = () => {
        const token = localStorage.getItem('auth_token');
        if (token && token !== 'undefined') {
          manager.connect(token, user.id);
          previousUserIdRef.current = user.id;
        } else {
          setTimeout(connectWithDelay, 100);
        }
      };

      connectWithDelay();
    } else if (!user) {
      manager.disconnect();
      previousUserIdRef.current = null;
    }
  }, [user?.id]);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager || !user) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (
      activeConversationId &&
      activeConversationId !== previousConversationIdRef.current
    ) {
      manager.connectToConversation(activeConversationId, token, user.id);
      previousConversationIdRef.current = activeConversationId;
    }

    if (!activeConversationId && previousConversationIdRef.current) {
      previousConversationIdRef.current = null;
    }
  }, [activeConversationId, user?.id]);

  const startTyping = useCallback((conversationId: number) => {
    managerRef.current?.startTyping(conversationId);
  }, []);

  const stopTyping = useCallback((conversationId: number) => {
    managerRef.current?.stopTyping(conversationId);
  }, []);

  const reconnect = useCallback(() => {
    managerRef.current?.reconnect();
  }, []);

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  const clearAuthError = useCallback(() => {
    managerRef.current?.clearAuthError();
  }, []);

  const retryAuth = useCallback(async () => {
    await managerRef.current?.retryAuth();
  }, []);

  const typingUsers = activeConversationId
    ? wsState.typingState[activeConversationId] || []
    : [];

  return {
    isConnected: wsState.isConnected,
    isReconnecting: wsState.isReconnecting,
    tokenExpiring: wsState.tokenExpiring,
    authError: wsState.authError,
    typingUsers,
    startTyping,
    stopTyping,
    reconnect,
    disconnect,
    clearAuthError,
    retryAuth,
  };
}
