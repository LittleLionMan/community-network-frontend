'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import {
  useNotificationStats,
  useInvalidateNotifications,
} from '@/hooks/useNotificationApi';
import { toast } from '@/components/ui/toast';
import type { NotificationStats } from '@/types/notification';

interface NotificationContextType {
  notificationStats: NotificationStats | undefined;
  isLoading: boolean;
  refetchStats: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const invalidateNotifications = useInvalidateNotifications();

  const {
    data: notificationStats,
    isLoading,
    refetch,
  } = useNotificationStats(isAuthenticated && !!user);

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      refetch();
    }
  }, [user?.id, isAuthenticated, refetch]);

  useEffect(() => {
    const handleGlobalWebSocketMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail;

      if (
        message.type === 'forum_reply' ||
        message.type === 'forum_mention' ||
        message.type === 'forum_quote'
      ) {
        if (document.hidden && message.message) {
          toast.success('Neue Benachrichtigung', message.message);
        }
        invalidateNotifications();
      }

      if (
        message.type === 'credit_received' ||
        message.type === 'credit_spent'
      ) {
        if (document.hidden && message.message) {
          toast.success(
            message.type === 'credit_received'
              ? 'Credits erhalten'
              : 'Credits ausgegeben',
            message.message
          );
        }
        invalidateNotifications();
      }
    };

    window.addEventListener(
      'global-websocket-message',
      handleGlobalWebSocketMessage
    );

    return () => {
      window.removeEventListener(
        'global-websocket-message',
        handleGlobalWebSocketMessage
      );
    };
  }, [invalidateNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notificationStats,
        isLoading,
        refetchStats: () => refetch(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
