'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import type { WebSocketMessage, MessageUser } from '@/types/message';

interface WebSocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
}

interface TypingState {
  [conversationId: number]: MessageUser[];
}

interface WebSocketManagerReturn {
  isConnected: boolean;
  isReconnecting: boolean;

  typingUsers: MessageUser[];
  startTyping: (conversationId: number) => void;
  stopTyping: (conversationId: number) => void;

  reconnect: () => void;
  disconnect: () => void;
}

class MessageWebSocketManager {
  private static instance: MessageWebSocketManager | null = null;
  private userWs: WebSocket | null = null;
  private conversationWs: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private typingTimeouts: Map<number, NodeJS.Timeout> = new Map();

  private currentConversationId: number | null = null;
  private currentUserId: number | null = null;
  private isConnecting: boolean = false;

  private state: WebSocketState = {
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
  };

  private typingState: TypingState = {};
  private subscribers: Set<
    (state: WebSocketState & { typingState: TypingState }) => void
  > = new Set();

  static getInstance(): MessageWebSocketManager {
    if (!MessageWebSocketManager.instance) {
      MessageWebSocketManager.instance = new MessageWebSocketManager();
    }
    return MessageWebSocketManager.instance;
  }

  subscribe(
    callback: (state: WebSocketState & { typingState: TypingState }) => void
  ) {
    this.subscribers.add(callback);
    callback({ ...this.state, typingState: this.typingState });

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    const currentState = {
      ...this.state,
      typingState: { ...this.typingState },
    };
    this.subscribers.forEach((callback) => callback(currentState));
  }

  connect(token: string, userId: number) {
    if (this.isConnecting) {
      return;
    }

    if (
      this.currentUserId === userId &&
      this.userWs?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    if (this.currentUserId !== userId) {
      this.cleanup();
    }

    this.currentUserId = userId;

    this.isConnecting = true;

    this.connectUserWebSocket(token, userId);
  }

  private connectUserWebSocket(token: string, userId: number) {
    if (this.userWs) {
      this.userWs.close(1000, 'Reconnecting');
      this.userWs = null;
    }

    try {
      this.userWs = apiClient.createWebSocket('/api/messages/ws/user', token);

      this.userWs.onopen = () => {
        this.isConnecting = false;
        this.state = {
          isConnected: true,
          isReconnecting: false,
          reconnectAttempts: 0,
        };
        this.notifySubscribers();
      };

      this.userWs.onclose = (event) => {
        this.state.isConnected = false;
        this.notifySubscribers();

        if (event.code !== 1000 && this.state.reconnectAttempts < 5) {
          this.scheduleReconnect(token, userId);
        } else {
          this.isConnecting = false;
          this.state.isReconnecting = false;
          this.notifySubscribers();

          if (
            event.code !== 1000 &&
            this.state.reconnectAttempts < 5 &&
            this.currentUserId === userId
          ) {
            this.scheduleReconnect(token, userId);
          } else {
            this.state.isReconnecting = false;
            this.notifySubscribers();
          }
        }
      };

      this.userWs.onerror = () => {
        this.isConnecting = false;
        this.state.isConnected = false;
        this.notifySubscribers();
      };

      this.userWs.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message, userId);
        } catch (err) {
          console.error('💥 Failed to parse user WebSocket message:', err);
        }
      };
    } catch (err) {
      console.error('💥 Failed to create user WebSocket:', err);
      this.isConnecting = false;
      this.state.isConnected = false;
      this.notifySubscribers();
    }
  }

  connectToConversation(conversationId: number, token: string, userId: number) {
    if (
      this.currentConversationId === conversationId &&
      this.conversationWs?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    if (this.conversationWs) {
      this.conversationWs.close();
      this.conversationWs = null;
    }

    this.currentConversationId = conversationId;

    try {
      this.conversationWs = apiClient.createWebSocket(
        `/api/messages/ws/conversations/${conversationId}`,
        token
      );

      this.conversationWs.onopen = () => {};

      this.conversationWs.onclose = () => {
        if (this.currentConversationId === conversationId) {
          this.currentConversationId = null;
        }
      };

      this.conversationWs.onerror = (error) => {
        console.error('💥 Conversation WebSocket error:', error);
      };

      this.conversationWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message, userId);
        } catch (err) {
          console.error(
            '💥 Failed to parse conversation WebSocket message:',
            err
          );
        }
      };
    } catch (err) {
      console.error('💥 Failed to create conversation WebSocket:', err);
    }
  }

  private scheduleReconnect(token: string, userId: number) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.state.isReconnecting = true;
    this.state.reconnectAttempts++;
    this.notifySubscribers();

    const delay = Math.min(
      1000 * Math.pow(2, this.state.reconnectAttempts - 1),
      30000
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect(token, userId);
    }, delay);
  }

  private handleMessage(message: WebSocketMessage, currentUserId: number) {
    window.dispatchEvent(
      new CustomEvent('global-websocket-message', { detail: message })
    );

    if (
      message.type === 'typing_status' &&
      message.conversation_id &&
      message.typing_users
    ) {
      const conversationId = message.conversation_id;
      const typingUserObjects = message.typing_users
        .filter((id) => id !== currentUserId)
        .map((id) => ({ id, display_name: `User ${id}` }));

      this.typingState[conversationId] = typingUserObjects;
      this.notifySubscribers();
    }
  }

  sendTyping(conversationId: number, isTyping: boolean) {
    if (
      this.conversationWs?.readyState === WebSocket.OPEN &&
      this.currentConversationId === conversationId
    ) {
      this.conversationWs.send(
        JSON.stringify({
          type: 'typing',
          is_typing: isTyping,
        })
      );
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
    this.currentUserId = null;
    this.state = {
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0,
    };
    this.typingState = {};
    this.notifySubscribers();
  }

  private cleanup() {
    this.isConnecting = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();

    if (this.userWs) {
      this.userWs.close(1000, 'Manual disconnect');
      this.userWs = null;
    }

    if (this.conversationWs) {
      this.conversationWs.close(1000, 'Manual disconnect');
      this.conversationWs = null;
    }

    this.currentConversationId = null;
  }

  static cleanup() {
    if (MessageWebSocketManager.instance) {
      MessageWebSocketManager.instance.cleanup();
      MessageWebSocketManager.instance = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    MessageWebSocketManager.cleanup();
  });
}

export function useMessageWebSocket(
  activeConversationId?: number | null
): WebSocketManagerReturn {
  const { user } = useAuthStore();
  const [wsState, setWsState] = useState<
    WebSocketState & { typingState: TypingState }
  >({
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    typingState: {},
  });

  const managerRef = useRef<MessageWebSocketManager | null>(null);
  const previousConversationIdRef = useRef<number | null>(null);
  const previousUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    managerRef.current = MessageWebSocketManager.getInstance();
    const unsubscribe = managerRef.current.subscribe(setWsState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    if (user && user.id !== previousUserIdRef.current) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        manager.connect(token, user.id);
      }
    } else {
      manager.disconnect();
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
    const manager = managerRef.current;
    if (!manager || !user) return;

    const token = localStorage.getItem('auth_token');
    if (token) {
      manager.connect(token, user.id);
    }
  }, [user?.id]);

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  const typingUsers = activeConversationId
    ? wsState.typingState[activeConversationId] || []
    : [];

  return {
    isConnected: wsState.isConnected,
    isReconnecting: wsState.isReconnecting,
    typingUsers,
    startTyping,
    stopTyping,
    reconnect,
    disconnect,
  };
}
