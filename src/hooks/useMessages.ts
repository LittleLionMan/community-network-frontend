'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type {
  Conversation,
  ConversationDetail,
  Message,
  CreateConversationData,
  CreateMessageData,
  UpdateMessageData,
  MessagePrivacySettings,
  UnreadCount,
  WebSocketMessage,
  MessageUser,
} from '@/types/message';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

interface ErrorState {
  [key: string]: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<ErrorState>({});
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const retry = useCallback(
    async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
      const { maxAttempts = 3, delay = 1000, backoff = true } = options;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxAttempts) {
            throw error;
          }
          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
      throw new Error('Max retry attempts reached');
    },
    []
  );

  const loadConversations = useCallback(
    async (refresh = false) => {
      try {
        setIsLoading(true);
        clearError('load');

        const currentPage = refresh ? 1 : page;
        const response = await retry(() =>
          apiClient.messages.getConversations(currentPage, 20)
        );

        if (refresh) {
          setConversations(response.conversations);
          setPage(1);
        } else {
          setConversations((prev) => [...prev, ...response.conversations]);
        }

        setHasMore(response.has_more);
        if (!refresh) setPage((prev) => prev + 1);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load conversations';
        setErrors((prev) => ({ ...prev, load: errorMessage }));
      } finally {
        setIsLoading(false);
      }
    },
    [page, retry, clearError]
  );

  const createConversation = async (data: CreateConversationData) => {
    try {
      clearError('create');
      const newConversation = await retry(() =>
        apiClient.messages.createConversation(data)
      );
      setConversations((prev) => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create conversation';
      setErrors((prev) => ({ ...prev, create: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, []);

  return {
    conversations,
    isLoading,
    errors,
    hasMore,
    loadConversations,
    createConversation,
    clearError,
    refreshConversations: () => loadConversations(true),
  };
}

export function useConversation(conversationId: number | null) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<CreateMessageData[]>([]);

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const retry = useCallback(
    async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
      const { maxAttempts = 3, delay = 1000, backoff = true } = options;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxAttempts) {
            throw error;
          }
          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
      throw new Error('Max retry attempts reached');
    },
    []
  );

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      clearError('load');

      const response = await retry(() =>
        apiClient.messages.getConversation(conversationId)
      );
      setConversation(response);
      setMessages(response.messages);
      setHasMoreMessages(response.has_more);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load conversation';
      setErrors((prev) => ({ ...prev, load: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, retry, clearError]);

  const sendMessage = async (data: CreateMessageData) => {
    if (!conversationId) throw new Error('No conversation selected');

    try {
      clearError('send');
      const newMessage = await retry(() =>
        apiClient.messages.sendMessage(conversationId, data)
      );
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      if (err instanceof Error && err.message.includes('fetch')) {
        setOfflineQueue((prev) => [...prev, data]);
        setErrors((prev) => ({
          ...prev,
          send: 'Nachricht wird gesendet, sobald die Verbindung wiederhergestellt ist.',
        }));
        return null;
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message';
      setErrors((prev) => ({ ...prev, send: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const editMessage = async (messageId: number, data: UpdateMessageData) => {
    try {
      clearError('edit');
      const updatedMessage = await retry(() =>
        apiClient.messages.editMessage(messageId, data)
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
      );
      return updatedMessage;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to edit message';
      setErrors((prev) => ({ ...prev, edit: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      clearError('delete');
      await retry(() => apiClient.messages.deleteMessage(messageId));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_deleted: true, content: '[Message deleted]' }
            : msg
        )
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete message';
      setErrors((prev) => ({ ...prev, delete: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const markAsRead = async (upToMessageId?: number) => {
    if (!conversationId) return;

    try {
      await apiClient.messages.markMessagesAsRead(
        conversationId,
        upToMessageId
      );
      setMessages((prev) =>
        prev.map((msg) =>
          !upToMessageId || msg.id <= upToMessageId
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const loadMoreMessages = async () => {
    if (!conversationId || isLoadingMore || !hasMoreMessages) return;

    try {
      setIsLoadingMore(true);
      const oldestMessageId = messages.length > 0 ? messages[0].id : undefined;

      const response = await retry(() =>
        apiClient.messages.getMessages(conversationId, 1, 50, oldestMessageId)
      );

      setMessages((prev) => [...response.messages, ...prev]);
      setHasMoreMessages(response.has_more);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const processOfflineQueue = useCallback(async () => {
    if (!conversationId || offlineQueue.length === 0) return;

    const failedMessages: CreateMessageData[] = [];

    for (const messageData of offlineQueue) {
      try {
        await apiClient.messages.sendMessage(conversationId, messageData);
      } catch (error) {
        failedMessages.push(messageData);
      }
    }

    setOfflineQueue(failedMessages);

    if (failedMessages.length === 0) {
      clearError('send');
    }
  }, [conversationId, offlineQueue, clearError]);

  useEffect(() => {
    const handleOnline = () => {
      processOfflineQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [processOfflineQueue]);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setConversation(null);
      setMessages([]);
    }
  }, [conversationId, loadConversation]);

  return {
    conversation,
    messages,
    isLoading,
    errors,
    hasMoreMessages,
    isLoadingMore,
    offlineQueueLength: offlineQueue.length,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    clearError,
    processOfflineQueue,
    refreshConversation: loadConversation,
  };
}

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({
    total_unread: 0,
    conversations: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.messages.getUnreadCount();
      setUnreadCount(response);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  return {
    unreadCount,
    isLoading,
    updateUnreadCount: setUnreadCount,
    refreshUnreadCount: loadUnreadCount,
  };
}

export function useMessageWebSocket(conversationId: number | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<MessageUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuthStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!conversationId || !user) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const ws = apiClient.createWebSocket(
        `/api/messages/ws/conversations/${conversationId}`,
        token
      );

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected to conversation', conversationId);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected from conversation', conversationId);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [conversationId, user]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setTypingUsers([]);
  }, []);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'typing_status':
        if (message.typing_users) {
          const typingUserObjects = message.typing_users
            .filter((id) => id !== user?.id)
            .map((id) => ({ id, display_name: `User ${id}` }));
          setTypingUsers(typingUserObjects);
        }
        break;
      case 'new_message':
      case 'message_edited':
      case 'message_deleted':
        window.dispatchEvent(
          new CustomEvent('websocket-message', { detail: message })
        );
        break;
    }
  };

  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'typing',
          is_typing: isTyping,
        })
      );
    }
  }, []);

  const startTyping = useCallback(() => {
    sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 3000);
  }, [sendTyping]);

  const stopTyping = useCallback(() => {
    sendTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [sendTyping]);

  useEffect(() => {
    if (conversationId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, connect, disconnect]);

  return {
    isConnected,
    typingUsers,
    startTyping,
    stopTyping,
    reconnect: connect,
  };
}

export function useMessagePrivacy() {
  const [settings, setSettings] = useState<MessagePrivacySettings>({
    messages_enabled: true,
    messages_from_strangers: true,
    messages_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const response = await apiClient.messages.getPrivacySettings();
      setSettings(response);
    } catch (err) {
      console.error('Failed to load privacy settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = async (
    newSettings: Partial<MessagePrivacySettings>
  ) => {
    try {
      await apiClient.messages.updatePrivacySettings(newSettings);
      setSettings((prev) => ({ ...prev, ...newSettings }));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to update privacy settings'
      );
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    refreshSettings: loadSettings,
  };
}
