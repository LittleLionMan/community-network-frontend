'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import type { UnreadCount, WebSocketMessage } from '@/types/message';
import { useMessagePrivacy } from '@/hooks/useMessages';

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
  const { user, isAuthenticated } = useAuthStore();

  const refreshUnreadCount = async () => {
    if (!user || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token || token === 'undefined') {
      console.log('No valid token available for unread count');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.messages.getUnreadCount();
      setUnreadCount(response);
    } catch (err) {
      console.error('Failed to load unread count:', err);
      if (err instanceof Error && err.message.includes('403')) {
        console.log('Authentication error - skipping unread count');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnreadCount = (count: UnreadCount) => {
    setUnreadCount(count);
  };

  const privacyHookResult = useMessagePrivacy();

  const privacySettings =
    isAuthenticated && user
      ? privacyHookResult.settings
      : { messages_notifications: true };

  useEffect(() => {
    const handleGlobalWebSocketMessage = (event: CustomEvent) => {
      const message: WebSocketMessage = event.detail;

      switch (message.type) {
        case 'new_message':
          console.log('New message event received:', message);
          console.log('Privacy settings:', privacySettings);
          console.log(
            'Should update unread?',
            privacySettings.messages_notifications !== false
          );
          if (
            message.conversation_id &&
            message.message?.sender.id !== user?.id &&
            privacySettings.messages_notifications !== false
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

  useEffect(() => {
    if (user && isAuthenticated) {
      const loadWithDelay = () => {
        const token = localStorage.getItem('auth_token');
        if (token && token !== 'undefined') {
          refreshUnreadCount();
        } else {
          setTimeout(loadWithDelay, 200);
        }
      };

      loadWithDelay();
    } else {
      setUnreadCount({ total_unread: 0, conversations: [] });
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

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
