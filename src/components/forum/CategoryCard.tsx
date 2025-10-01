'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';
import {
  DynamicIcon,
  formatRelative,
  getContrastColor,
} from '@/lib/forum-utils';
import type { ForumCategory } from '@/types/forum';

interface CategoryCardProps {
  category: ForumCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const bgColor = category.color || '#E5E7EB';
  const textColor = getContrastColor(bgColor);

  return (
    <Link
      href={`/forum/categories/${category.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
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
          <h3 className="text-lg font-semibold text-gray-900">
            {category.name}
          </h3>
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

            {category.latest_thread && (
              <div className="flex items-center gap-2">
                <span>Neueste:</span>
                <span className="truncate font-medium text-gray-700">
                  {category.latest_thread.title}
                </span>
                <span>{formatRelative(category.latest_thread.created_at)}</span>
              </div>
            )}
          </div>
        </div>

        <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
      </div>
    </Link>
  );
}
