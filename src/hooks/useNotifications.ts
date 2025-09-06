'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';

type PermissionState = 'default' | 'granted' | 'denied';

interface NotificationPermissionState {
  permission: PermissionState;
  isSupported: boolean;
}

interface NotificationData {
  type: string;
  conversationId?: number;
  senderName?: string;
  [key: string]: unknown;
}

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: NotificationData;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export function useNotifications() {
  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>({
      permission: 'default',
      isSupported: false,
    });
  const [isRegistering, setIsRegistering] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState({
        permission: Notification.permission as PermissionState,
        isSupported: true,
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (!permissionState.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      const permission = await Notification.requestPermission();
      const permissionState: PermissionState = permission as PermissionState;
      setPermissionState((prev) => ({ ...prev, permission: permissionState }));
      return permissionState;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }, [permissionState.isSupported]);

  const showNotification = useCallback(
    (data: PushNotificationData): Notification | null => {
      if (permissionState.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      try {
        const notification = new Notification(data.title, {
          body: data.body,
          icon: data.icon || '/icon-192x192.png',
          badge: data.badge || '/badge-72x72.png',
          tag: data.tag,
          data: data.data,
          requireInteraction: true,
          silent: false,
        });

        notification.onclick = (event) => {
          event.preventDefault();
          notification.close();
          window.focus();
          if (data.data?.type === 'message') {
            window.location.href = '/messages';
          }
        };

        setTimeout(() => {
          notification.close();
        }, 10000);

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
        return null;
      }
    },
    [permissionState.permission]
  );

  const showMessageNotification = useCallback(
    (senderName: string, messageContent: string, conversationId: number) => {
      const truncatedContent =
        messageContent.length > 100
          ? messageContent.substring(0, 100) + '...'
          : messageContent;

      return showNotification({
        title: `Neue Nachricht von ${senderName}`,
        body: truncatedContent,
        tag: `message-${conversationId}`,
        data: {
          type: 'message',
          conversationId,
          senderName,
        },
        actions: [
          {
            action: 'reply',
            title: 'Antworten',
          },
          {
            action: 'mark-read',
            title: 'Als gelesen markieren',
          },
        ],
      });
    },
    [showNotification]
  );

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Service Worker or Push Manager not supported');
    }

    setIsRegistering(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return {
    permissionState,
    isRegistering,
    requestPermission,
    showNotification,
    showMessageNotification,
    registerServiceWorker,
  };
}
