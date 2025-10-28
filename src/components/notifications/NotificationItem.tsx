'use client';

// src/components/notifications/NotificationItem.tsx

import { MessageSquare, AtSign, Quote } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import type { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'gerade eben';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `vor ${diffInMinutes} ${diffInMinutes === 1 ? 'Minute' : 'Minuten'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `vor ${diffInHours} ${diffInHours === 1 ? 'Stunde' : 'Stunden'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `vor ${diffInDays} ${diffInDays === 1 ? 'Tag' : 'Tagen'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `vor ${diffInWeeks} ${diffInWeeks === 1 ? 'Woche' : 'Wochen'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `vor ${diffInMonths} ${diffInMonths === 1 ? 'Monat' : 'Monaten'}`;
}

function stripHtml(html: string): string {
  // Create a temporary DOM element
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // Get text content (strips all HTML tags)
  const text = tmp.textContent || tmp.innerText || '';

  // Clean up extra whitespace
  return text.replace(/\s+/g, ' ').trim();
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const { data, is_read, created_at, type } = notification;

  const getIcon = () => {
    switch (type) {
      case 'forum_reply':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'forum_mention':
        return <AtSign className="h-4 w-4 text-green-500" />;
      case 'forum_quote':
        return <Quote className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'forum_reply':
        return `${data.actor.display_name} hat auf deinen Thread geantwortet`;
      case 'forum_mention':
        return `${data.actor.display_name} hat dich erwähnt`;
      case 'forum_quote':
        return `${data.actor.display_name} hat deinen Post zitiert`;
      default:
        return 'Neue Benachrichtigung';
    }
  };

  const relativeTime = getRelativeTime(created_at);
  const cleanPreview = stripHtml(data.content_preview);

  return (
    <button
      onClick={() => onClick(notification)}
      className={cn(
        'w-full px-4 py-3 text-left transition-colors hover:bg-gray-50',
        !is_read && 'border-l-4 border-l-blue-500 bg-blue-50'
      )}
    >
      <div className="flex gap-3">
        <div className="mt-1 flex-shrink-0">
          <ProfileAvatar
            user={{
              display_name: data.actor.display_name,
              profile_image_url: data.actor.profile_image_url,
            }}
            size="sm"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start gap-2">
            {getIcon()}
            <p className={cn('text-sm', !is_read && 'font-semibold')}>
              {getMessage()}
            </p>
          </div>

          <p className="mb-1 text-xs text-gray-600">
            in: <span className="font-medium">{data.thread_title}</span>
          </p>

          <p className="mb-2 text-sm text-gray-700">{cleanPreview}</p>

          <p className="text-xs text-gray-500">{relativeTime}</p>
        </div>
      </div>
    </button>
  );
}
