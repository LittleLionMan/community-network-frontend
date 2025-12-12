'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import type { UnreadCount, WebSocketMessage } from '@/types/message';

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
  const [openConversationId, setOpenConversationId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setOpenConversationId(e.detail.conversationId);
    };
    window.addEventListener(
      'conversation-state-changed',
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        'conversation-state-changed',
        handler as EventListener
      );
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token || token === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.messages.getUnreadCount();
      setUnreadCount(response);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  const updateUnreadCount = useCallback((count: UnreadCount) => {
    setUnreadCount(count);
  }, []);

  const updateConversationUnreadCount = useCallback(
    (conversationId: number, count: number) => {
      setUnreadCount((prev) => {
        const existingConvIndex = prev.conversations.findIndex(
          (c) => c.conversation_id === conversationId
        );

        const newConversations = [...prev.conversations];

        if (count === 0) {
          if (existingConvIndex >= 0) {
            newConversations.splice(existingConvIndex, 1);
          }
        } else {
          if (existingConvIndex >= 0) {
            newConversations[existingConvIndex] = {
              conversation_id: conversationId,
              unread_count: count,
            };
          } else {
            newConversations.push({
              conversation_id: conversationId,
              unread_count: count,
            });
          }
        }

        const total_unread = newConversations.reduce(
          (sum, conv) => sum + conv.unread_count,
          0
        );

        return {
          total_unread,
          conversations: newConversations,
        };
      });
    },
    []
  );

  useEffect(() => {
    const handleGlobalWebSocketMessage = (event: CustomEvent) => {
      const message: WebSocketMessage = event.detail;

      switch (message.type) {
        case 'unread_count_update':
          if (message.data && typeof message.data === 'object') {
            const unreadData = message.data as unknown as UnreadCount;
            if ('total_unread' in unreadData && 'conversations' in unreadData) {
              if (openConversationId) {
                const filtered: UnreadCount = {
                  conversations: unreadData.conversations
                    .map((c) =>
                      c.conversation_id === openConversationId
                        ? { ...c, unread_count: 0 }
                        : c
                    )
                    .filter((c) => c.unread_count > 0),
                  total_unread: unreadData.conversations
                    .filter((c) => c.conversation_id !== openConversationId)
                    .reduce((sum, c) => sum + c.unread_count, 0),
                };
                updateUnreadCount(filtered);
              } else {
                console.log('✅ Applied as-is (no chat open)');
                updateUnreadCount(unreadData);
                updateUnreadCount(unreadData);
              }
            }
          }
          break;

        default:
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
  }, [user?.id, updateUnreadCount, openConversationId]);

  useEffect(() => {
    const handleMarkedRead = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      updateConversationUnreadCount(conversationId, 0);
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
  }, [updateConversationUnreadCount]);

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
  }, [user, isAuthenticated, refreshUnreadCount]);

  const contextValue = useMemo(
    () => ({
      unreadCount,
      updateUnreadCount,
      refreshUnreadCount,
      isLoading,
    }),
    [unreadCount, updateUnreadCount, refreshUnreadCount, isLoading]
  );

  return (
    <UnreadCountContext.Provider value={contextValue}>
      {children}
    </UnreadCountContext.Provider>
  );
}
