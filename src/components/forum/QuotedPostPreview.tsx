'use client';

import { X, Quote } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatRelative } from '@/lib/forum-utils';
import type { ForumPost } from '@/types/forum';

interface QuotedPostPreviewProps {
  post: ForumPost;
  onRemove: () => void;
}

export function QuotedPostPreview({ post, onRemove }: QuotedPostPreviewProps) {
  const truncatedContent = post.content.replace(/<[^>]*>/g, '').slice(0, 150);

  return (
    <div className="mb-4 rounded-lg border border-community-300 bg-community-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Quote className="h-4 w-4 text-community-600" />
          <span className="text-sm font-medium text-gray-700">
            Zitiere Post von:
          </span>
        </div>
        <button
          onClick={onRemove}
          className="rounded-full p-1 text-gray-500 hover:bg-community-100 hover:text-gray-700"
          title="Zitat entfernen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <ProfileAvatar user={post.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium">{post.author.display_name}</span>
            <span>·</span>
            <span>{formatRelative(post.created_at)}</span>
          </div>
          <div className="text-sm text-gray-700">
            {truncatedContent}
            {post.content.replace(/<[^>]*>/g, '').length > 150 && '...'}
          </div>
        </div>
      </div>
    </div>
  );
}
