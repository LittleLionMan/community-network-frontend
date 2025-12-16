'use client';

import { MessageSquare, AtSign, Quote, Coins, ArrowDown } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import type {
  Notification,
  ForumNotificationData,
  CreditNotificationData,
} from '@/types/notification';
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
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  const text = tmp.textContent || tmp.innerText || '';

  return text.replace(/\s+/g, ' ').trim();
}

function isCreditNotification(
  type: string
): type is 'credit_received' | 'credit_spent' {
  return type === 'credit_received' || type === 'credit_spent';
}

function isForumNotification(
  type: string
): type is 'forum_reply' | 'forum_mention' | 'forum_quote' {
  return (
    type === 'forum_reply' || type === 'forum_mention' || type === 'forum_quote'
  );
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
      case 'credit_received':
        return <Coins className="h-4 w-4 text-yellow-500" />;
      case 'credit_spent':
        return <ArrowDown className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessage = () => {
    if (isForumNotification(type)) {
      const forumData = data as ForumNotificationData;
      switch (type) {
        case 'forum_reply':
          return `${forumData.actor.display_name} hat auf deinen Thread geantwortet`;
        case 'forum_mention':
          return `${forumData.actor.display_name} hat dich erwähnt`;
        case 'forum_quote':
          return `${forumData.actor.display_name} hat deinen Post zitiert`;
      }
    }

    if (isCreditNotification(type)) {
      const creditData = data as CreditNotificationData;
      const creditText = creditData.credit_amount === 1 ? 'Credit' : 'Credits';

      if (type === 'credit_received') {
        return `Du hast ${creditData.credit_amount} ${creditText} erhalten`;
      } else {
        return `Du hast ${creditData.credit_amount} ${creditText} ausgegeben`;
      }
    }

    return 'Neue Benachrichtigung';
  };

  const getActorInfo = () => {
    if (isForumNotification(type)) {
      const forumData = data as ForumNotificationData;
      return {
        display_name: forumData.actor.display_name,
        profile_image_url: forumData.actor.profile_image_url,
      };
    }

    if (isCreditNotification(type)) {
      const creditData = data as CreditNotificationData;
      if (type === 'credit_received' && creditData.sender) {
        return {
          display_name: creditData.sender.display_name,
          profile_image_url: creditData.sender.profile_image_url,
        };
      }
      if (type === 'credit_spent' && creditData.recipient) {
        return {
          display_name: creditData.recipient.display_name,
          profile_image_url: creditData.recipient.profile_image_url,
        };
      }
    }

    return {
      display_name: 'System',
      profile_image_url: undefined,
    };
  };

  const getPreview = () => {
    if (isForumNotification(type)) {
      const forumData = data as ForumNotificationData;
      return stripHtml(forumData.content_preview);
    }

    if (isCreditNotification(type)) {
      const creditData = data as CreditNotificationData;
      return creditData.offer_title;
    }

    return '';
  };

  const getSubtitle = () => {
    if (isForumNotification(type)) {
      const forumData = data as ForumNotificationData;
      return `in: ${forumData.thread_title}`;
    }

    if (isCreditNotification(type)) {
      const creditData = data as CreditNotificationData;
      const creditText = creditData.credit_amount === 1 ? 'Credit' : 'Credits';
      return `${creditData.credit_amount} ${creditText}`;
    }

    return '';
  };

  const relativeTime = getRelativeTime(created_at);
  const actorInfo = getActorInfo();
  const preview = getPreview();
  const subtitle = getSubtitle();

  return (
    <button
      onClick={() => onClick(notification)}
      className={cn(
        'w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700',
        !is_read &&
          'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/30'
      )}
    >
      <div className="flex gap-3">
        <div className="mt-1 flex-shrink-0">
          <ProfileAvatar user={actorInfo} size="sm" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start gap-2">
            {getIcon()}
            <p
              className={cn(
                'text-sm text-gray-900 dark:text-gray-100',
                !is_read && 'font-semibold'
              )}
            >
              {getMessage()}
            </p>
          </div>

          {subtitle && (
            <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          {preview && (
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              {preview}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-500">
            {relativeTime}
          </p>
        </div>
      </div>
    </button>
  );
}
