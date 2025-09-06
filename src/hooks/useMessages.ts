// src/hooks/useMessages.ts
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
  ConversationSettings,
  MessagePrivacySettings,
  UnreadCount,
  WebSocketMessage,
  TypingStatus,
  MessageUser,
} from '@/types/message';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadConversations = useCallback(
    async (refresh = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentPage = refresh ? 1 : page;
        const response = await apiClient.messages.getConversations(
          currentPage,
          20
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
        setError(
          err instanceof Error ? err.message : 'Failed to load conversations'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page]
  );

  const createConversation = async (data: CreateConversationData) => {
    try {
      const newConversation = await apiClient.messages.createConversation(data);
      setConversations((prev) => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to create conversation'
      );
    }
  };

  const updateConversationSettings = async (
    conversationId: number,
    settings: ConversationSettings
  ) => {
    try {
      await apiClient.messages.updateConversationSettings(
        conversationId,
        settings
      );

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                participants: conv.participants.map((p) => ({
                  ...p,
                  ...settings,
                })),
              }
            : conv
        )
      );
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Failed to update conversation settings'
      );
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, []);

  return {
    conversations,
    isLoading,
    error,
    hasMore,
    loadConversations,
    createConversation,
    updateConversationSettings,
    refreshConversations: () => loadConversations(true),
  };
}

export function useConversation(conversationId: number | null) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.messages.getConversation(conversationId);
      setConversation(response);
      setMessages(response.messages);
      setHasMoreMessages(response.has_more);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load conversation'
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const loadMoreMessages = async () => {
    if (!conversationId || isLoadingMore || !hasMoreMessages) return;

    try {
      setIsLoadingMore(true);
      const oldestMessageId = messages.length > 0 ? messages[0].id : undefined;

      const response = await apiClient.messages.getMessages(
        conversationId,
        1,
        50,
        oldestMessageId
      );

      setMessages((prev) => [...response.messages, ...prev]);
      setHasMoreMessages(response.has_more);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sendMessage = async (data: CreateMessageData) => {
    if (!conversationId) throw new Error('No conversation selected');

    try {
      const newMessage = await apiClient.messages.sendMessage(
        conversationId,
        data
      );
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to send message'
      );
    }
  };

  const editMessage = async (messageId: number, data: UpdateMessageData) => {
    try {
      const updatedMessage = await apiClient.messages.editMessage(
        messageId,
        data
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
      );
      return updatedMessage;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to edit message'
      );
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await apiClient.messages.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_deleted: true, content: '[Message deleted]' }
            : msg
        )
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to delete message'
      );
    }
  };

  const markAsRead = async (upToMessageId?: number) => {
    if (!conversationId) return;

    try {
      await apiClient.messages.markMessagesAsRead(
        conversationId,
        upToMessageId
      );

      // Update local state
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
    error,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
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
            .map((id) => ({ id, display_name: `User ${id}` })); // Fallback name
          setTypingUsers(typingUserObjects);
        }
        break;
      case 'new_message':
      case 'message_edited':
      case 'message_deleted':
        // These will be handled by parent components through custom events
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

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
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
