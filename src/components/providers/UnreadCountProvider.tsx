'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import type { UnreadCount, WebSocketMessage } from '@/types/message';
import { useMessageWebSocket } from '@/hooks/useMessageWebSocket';

interface UnreadCountContextType {
  unreadCount: UnreadCount;
  updateUnreadCount: (count: UnreadCount) => void;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
}

const UnreadCountContext = createContext<UnreadCountContextType | null>(null);

export function useGlobalUnreadCount() {
  const context = useContext(UnreadCountContext);
  if (!context) {
    throw new Error(
      'useGlobalUnreadCount must be used within UnreadCountProvider'
    );
  }
  return context;
}

interface UnreadCountProviderProps {
  children: React.ReactNode;
}

export function UnreadCountProvider({ children }: UnreadCountProviderProps) {
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({
    total_unread: 0,
    conversations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { isConnected } = useMessageWebSocket();

  const refreshUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await apiClient.messages.getUnreadCount();
      setUnreadCount(response);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnreadCount = (count: UnreadCount) => {
    setUnreadCount(count);
  };

  useEffect(() => {
    const handleGlobalWebSocketMessage = (event: CustomEvent) => {
      const message: WebSocketMessage = event.detail;

      switch (message.type) {
        case 'new_message':
          if (
            message.conversation_id &&
            message.message?.sender.id !== user?.id
          ) {
            refreshUnreadCount();
          }
          break;

        case 'messages_read':
          if (message.user_id !== user?.id) {
            refreshUnreadCount();
          }
          break;

        case 'unread_count_update':
          if (message.data && typeof message.data === 'object') {
            const unreadData = message.data as unknown as UnreadCount;
            if ('total_unread' in unreadData && 'conversations' in unreadData) {
              updateUnreadCount(unreadData);
            }
          }
          break;
      }
    };

    window.addEventListener(
      'global-websocket-message',
      handleGlobalWebSocketMessage as EventListener
    );

    return () => {
      window.removeEventListener(
        'global-websocket-message',
        handleGlobalWebSocketMessage as EventListener
      );
    };
  }, [user?.id]);

  useEffect(() => {
    const handleMarkedRead = (event: CustomEvent) => {
      const { conversationId } = event.detail;

      setUnreadCount((prev) => {
        const existingConvIndex = prev.conversations.findIndex(
          (c) => c.conversation_id === conversationId
        );

        if (existingConvIndex >= 0) {
          const newConversations = [...prev.conversations];
          newConversations.splice(existingConvIndex, 1);

          const total_unread = newConversations.reduce(
            (sum, conv) => sum + conv.unread_count,
            0
          );

          return {
            total_unread,
            conversations: newConversations,
          };
        }

        return prev;
      });
    };

    window.addEventListener(
      'messages-marked-read',
      handleMarkedRead as EventListener
    );

    return () => {
      window.removeEventListener(
        'messages-marked-read',
        handleMarkedRead as EventListener
      );
    };
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      refreshUnreadCount();
    } else {
      setUnreadCount({ total_unread: 0, conversations: [] });
      setIsLoading(false);
    }
  }, [user]);

  // Auto-refresh für offline Situationen
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return (
    <UnreadCountContext.Provider
      value={{
        unreadCount,
        updateUnreadCount,
        refreshUnreadCount,
        isLoading,
      }}
    >
      {children}
    </UnreadCountContext.Provider>
  );
}
