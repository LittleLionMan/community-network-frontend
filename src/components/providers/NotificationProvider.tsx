'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useNotificationApi } from '@/hooks/useNotificationApi';
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
  const { useNotificationStats, invalidateNotifications } =
    useNotificationApi();

  const {
    data: notificationStats,
    isLoading,
    refetch,
  } = useNotificationStats(isAuthenticated && !!user);

  useEffect(() => {
    if (user && isAuthenticated) {
      invalidateNotifications();
    }
  }, [user?.id, isAuthenticated, invalidateNotifications]);

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

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isAuthenticated, refetch]);

  useEffect(() => {
    if (user && isAuthenticated) {
      refetch();
    }
  }, [user?.id, isAuthenticated, refetch]);

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
