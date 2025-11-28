'use client';

import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/types/notification';
import { Loader2 } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationList({
  notifications,
  isLoading,
  onNotificationClick,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Keine neuen Benachrichtigungen
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
}
