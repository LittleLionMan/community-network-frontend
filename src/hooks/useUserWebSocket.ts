'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { AuthenticatedWebSocket } from '@/lib/websocket/AuthenticatedWebSocket';
import type { WebSocketMessage, MessageUser } from '@/types/message';
import type {
  WebSocketConnectionState,
  WebSocketAuthError,
} from '@/types/websocket';

interface ConversationWebSocketState {
  typingUsers: MessageUser[];
}

interface ConversationWebSocketManagerReturn {
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

class ConversationWebSocketManager {
  private conversationWs: AuthenticatedWebSocket | null = null;
  private typingTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private currentConversationId: number | null = null;

  private state: ConversationWebSocketState = {
    typingUsers: [],
  };

  private subscribers: Set<(state: ConversationWebSocketState) => void> =
    new Set();

  subscribe(callback: (state: ConversationWebSocketState) => void) {
    this.subscribers.add(callback);
    callback(this.state);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback({ ...this.state }));
  }

  connectToConversation(conversationId: number, token: string, userId: number) {
    if (
      this.currentConversationId === conversationId &&
      this.conversationWs?.getState().isConnected
    ) {
      return;
    }

    if (this.conversationWs) {
      this.conversationWs.disconnect();
      this.conversationWs = null;
    }

    this.currentConversationId = conversationId;
    this.state.typingUsers = [];

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
          this.state.typingUsers = [];
          this.notifySubscribers();
        }
      });

      this.conversationWs.connect(token);
    } catch (err) {
      console.error('Failed to create conversation WebSocket:', err);
    }
  }

  private handleMessage(message: WebSocketMessage, currentUserId: number) {
    window.dispatchEvent(
      new CustomEvent('global-websocket-message', { detail: message })
    );

    if (message.type === 'typing_status' && message.typing_users) {
      const typingUserObjects = message.typing_users
        .filter((id) => id !== currentUserId)
        .map((id) => ({ id, display_name: `User ${id}` }));

      this.state.typingUsers = typingUserObjects;
      this.notifySubscribers();
    }
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

  disconnect() {
    this.cleanup();
    this.state.typingUsers = [];
    this.notifySubscribers();
  }

  private cleanup() {
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();

    if (this.conversationWs) {
      this.conversationWs.destroy();
      this.conversationWs = null;
    }

    this.currentConversationId = null;
  }
}

class GlobalWebSocketStateManager {
  private static instance: GlobalWebSocketStateManager | null = null;

  private state: WebSocketConnectionState & { authError?: WebSocketAuthError } =
    {
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0,
      tokenExpiring: false,
    };

  private subscribers: Set<
    (
      state: WebSocketConnectionState & { authError?: WebSocketAuthError }
    ) => void
  > = new Set();

  static getInstance(): GlobalWebSocketStateManager {
    if (!GlobalWebSocketStateManager.instance) {
      GlobalWebSocketStateManager.instance = new GlobalWebSocketStateManager();
    }
    return GlobalWebSocketStateManager.instance;
  }

  subscribe(
    callback: (
      state: WebSocketConnectionState & { authError?: WebSocketAuthError }
    ) => void
  ) {
    this.subscribers.add(callback);
    callback(this.state);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  updateState(
    updates: Partial<
      WebSocketConnectionState & { authError?: WebSocketAuthError }
    >
  ) {
    this.state = { ...this.state, ...updates };
    this.subscribers.forEach((callback) => callback({ ...this.state }));
  }

  getState() {
    return { ...this.state };
  }

  async retryAuth() {
    const authStore = useAuthStore.getState();
    await authStore.refreshToken();
  }
}

if (typeof window !== 'undefined') {
  const stateManager = GlobalWebSocketStateManager.getInstance();

  window.addEventListener('global-websocket-state', ((event: CustomEvent) => {
    stateManager.updateState(event.detail);
  }) as EventListener);
}

export function useUserWebSocket(
  activeConversationId?: number | null
): ConversationWebSocketManagerReturn {
  const { user } = useAuthStore();

  const [globalState, setGlobalState] = useState(() =>
    GlobalWebSocketStateManager.getInstance().getState()
  );

  const [conversationState, setConversationState] =
    useState<ConversationWebSocketState>({
      typingUsers: [],
    });

  const conversationManagerRef = useRef<ConversationWebSocketManager | null>(
    null
  );
  const previousConversationIdRef = useRef<number | null>(null);

  useEffect(() => {
    conversationManagerRef.current = new ConversationWebSocketManager();
    const unsubscribe =
      conversationManagerRef.current.subscribe(setConversationState);
    return () => {
      unsubscribe();
      conversationManagerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const stateManager = GlobalWebSocketStateManager.getInstance();
    return stateManager.subscribe(setGlobalState);
  }, []);

  useEffect(() => {
    const manager = conversationManagerRef.current;
    if (!manager || !user) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (
      activeConversationId &&
      activeConversationId !== previousConversationIdRef.current
    ) {
      manager.connectToConversation(activeConversationId, token, user.id);
      previousConversationIdRef.current = activeConversationId;
    } else if (!activeConversationId && previousConversationIdRef.current) {
      manager.disconnect();
      previousConversationIdRef.current = null;
    }
  }, [activeConversationId, user?.id]);

  const startTyping = useCallback((conversationId: number) => {
    conversationManagerRef.current?.startTyping(conversationId);
  }, []);

  const stopTyping = useCallback((conversationId: number) => {
    conversationManagerRef.current?.stopTyping(conversationId);
  }, []);

  const reconnect = useCallback(() => {
    window.dispatchEvent(new CustomEvent('global-websocket-reconnect'));
  }, []);

  const disconnect = useCallback(() => {
    window.dispatchEvent(new CustomEvent('global-websocket-disconnect'));
  }, []);

  const clearAuthError = useCallback(() => {
    const stateManager = GlobalWebSocketStateManager.getInstance();
    stateManager.updateState({ authError: undefined });
  }, []);

  const retryAuth = useCallback(async () => {
    const stateManager = GlobalWebSocketStateManager.getInstance();
    await stateManager.retryAuth();
  }, []);

  return {
    isConnected: globalState.isConnected,
    isReconnecting: globalState.isReconnecting,
    tokenExpiring: globalState.tokenExpiring,
    authError: globalState.authError,
    typingUsers: conversationState.typingUsers,
    startTyping,
    stopTyping,
    reconnect,
    disconnect,
    clearAuthError,
    retryAuth,
  };
}
