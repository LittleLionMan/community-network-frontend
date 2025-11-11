'use client';

import Link from 'next/link';
import { Pin, Lock, MessageSquare } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatRelative } from '@/lib/forum-utils';
import type { ForumThread } from '@/types/forum';

interface ThreadCardProps {
  thread: ForumThread;
  showCategory?: boolean;
  isUnread?: boolean;
}

export function ThreadCard({
  thread,
  showCategory = false,
  isUnread = false,
}: ThreadCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isUnread
          ? 'dark:bg-community-950/50 dark:hover:bg-community-950/70 border-community-300 bg-community-50 hover:bg-community-100 dark:border-community-700'
          : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            {isUnread && (
              <div
                className="h-2 w-2 flex-shrink-0 rounded-full bg-community-600 dark:bg-community-400"
                title="Ungelesen"
              />
            )}
            {thread.is_pinned && (
              <Pin className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            )}
            {thread.is_locked && (
              <Lock className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            )}

            <Link
              href={`/forum/threads/${thread.id}`}
              className={`min-w-0 flex-1 text-lg font-semibold transition-colors hover:text-community-600 dark:hover:text-community-400 ${
                isUnread
                  ? 'text-gray-900 dark:text-gray-600'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <span className="line-clamp-2">{thread.title}</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ProfileAvatar user={thread.creator} size="sm" />
              <span>von {thread.creator.display_name}</span>
            </div>

            <span>Erstellt: {formatRelative(thread.created_at)}</span>

            {thread.latest_post && (
              <span>Letzte Antwort: {formatRelative(thread.latest_post)}</span>
            )}

            {showCategory && (
              <Link
                href={`/forum/categories/${thread.category.id}`}
                className="rounded-full bg-community-100 px-2.5 py-0.5 text-xs font-medium text-community-800 hover:bg-community-200 dark:bg-community-900 dark:text-community-200 dark:hover:bg-community-800"
                onClick={(e) => e.stopPropagation()}
              >
                {thread.category.name}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 text-gray-600 dark:text-gray-400">
          <MessageSquare className="h-5 w-5" />
          <span
            className={`font-medium ${
              isUnread
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {thread.post_count}
          </span>
        </div>
      </div>
    </div>
  );
}
