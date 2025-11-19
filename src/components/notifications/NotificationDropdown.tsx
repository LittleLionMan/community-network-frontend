'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/components/providers/NotificationProvider';
import {
  useNotifications as useNotificationsList,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotificationApi';
import { NotificationList } from './NotificationList';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types/notification';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { notificationStats } = useNotifications();
  const { data: notifications = [], isLoading } = useNotificationsList({
    limit: 10,
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notificationStats?.total_unread ?? 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead.mutateAsync({
          notificationId: notification.id,
          isRead: true,
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    router.push(
      `/forum/threads/${notification.data.thread_id}?post=${notification.data.post_id}`
    );
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync(undefined);
      toast.success('Alle Benachrichtigungen als gelesen markiert');
    } catch (error) {
      toast.error('Fehler beim Markieren der Benachrichtigungen');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center justify-center rounded-md p-2 transition-colors',
          isOpen
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
        )}
        aria-label="Benachrichtigungen"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-16 z-50 rounded-md border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:absolute sm:inset-x-auto sm:right-0 sm:w-96">
          <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Benachrichtigungen
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                className="text-xs"
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Alle als gelesen
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}
