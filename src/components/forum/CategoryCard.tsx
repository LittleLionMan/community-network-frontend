'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';
import {
  DynamicIcon,
  formatRelative,
  getContrastColor,
} from '@/lib/forum-utils';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import type { ForumCategory } from '@/types/forum';

interface CategoryCardProps {
  category: ForumCategory;
  unreadCount?: number;
}

export function CategoryCard({ category, unreadCount = 0 }: CategoryCardProps) {
  const bgColor = category.color || '#E5E7EB';
  const textColor = getContrastColor(bgColor);

  const displayActivity =
    category.latest_activity_thread || category.latest_thread;
  const displayActivityTime =
    category.latest_activity_at || displayActivity?.created_at;
  const displayActivityAuthor =
    category.latest_activity_post?.author || displayActivity?.creator;

  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={`/forum/categories/${category.id}`}
      className={`block rounded-lg border p-6 transition-all hover:shadow-md ${
        hasUnread
          ? 'border-community-200 bg-blue-50 dark:border-community-800 dark:bg-blue-950/30'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <DynamicIcon
            name={category.icon}
            className={`h-6 w-6 ${textColor}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {category.name}
            </h3>
            {hasUnread && (
              <span className="inline-flex items-center rounded-full bg-community-600 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-community-500">
                {unreadCount} neu
              </span>
            )}
          </div>
          {category.description && (
            <p className="mt-1 text-sm text-gray-600">{category.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>
                {category.thread_count}{' '}
                {category.thread_count === 1 ? 'Thread' : 'Threads'}
              </span>
            </div>

            {displayActivity && displayActivityTime && (
              <div className="flex items-center gap-2">
                <span>
                  {category.latest_activity_thread
                    ? 'Letzte Aktivität:'
                    : 'Neueste:'}
                </span>
                <span className="truncate font-medium text-gray-700">
                  {displayActivity.title}
                </span>
                {displayActivityAuthor && (
                  <>
                    <span>von</span>
                    <ProfileAvatar user={displayActivityAuthor} size="sm" />
                    <span className="font-medium text-gray-700">
                      {displayActivityAuthor.display_name}
                    </span>
                  </>
                )}
                <span>{formatRelative(displayActivityTime)}</span>
              </div>
            )}
          </div>
        </div>

        <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
      </div>
    </Link>
  );
}
