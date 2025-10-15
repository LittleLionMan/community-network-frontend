'use client';

import { useState } from 'react';
import { Edit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { PostEditForm } from '@/components/forum/PostEditForm';
import { PostDeleteButton } from '@/components/forum/PostDeleteButton';
import { QuoteButton } from '@/components/forum/QuoteButton';
import { QuotedPostDisplay } from '@/components/forum/QuotedPostDisplay';
import { AwardBugBountyButton } from '@/components/achievements/AwardBugBountyButton';
import { useAuthStore } from '@/store/auth';
import { formatAbsolute } from '@/lib/forum-utils';
import type { ForumPost } from '@/types/forum';

interface PostCardProps {
  post: ForumPost;
  canEdit: boolean;
  canDelete: boolean;
  onQuote?: (post: ForumPost) => void;
  showQuoteButton?: boolean;
  threadId?: number; // ADDED: To check if it's the bug bounty thread
  showAchievementButton?: boolean; // ADDED: Control visibility
}

export function PostCard({
  post,
  canEdit,
  canDelete,
  onQuote,
  showQuoteButton = true,
  threadId,
  showAchievementButton = false,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuthStore();

  const showBugBountyButton =
    showAchievementButton && user?.is_admin && threadId === 6; // Thread Id anpassen!

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {post.has_achievement && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          <CheckCircle className="h-4 w-4" />
          Bestätigter Bug
        </div>
      )}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ProfileAvatar user={post.author} size="md" />
          <div>
            <div className="font-semibold text-gray-900">
              {post.author.display_name}
            </div>
            <div className="text-sm text-gray-500">
              {formatAbsolute(post.created_at)}
              {post.updated_at && <span className="ml-2">(bearbeitet)</span>}
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            {showQuoteButton && onQuote && (
              <QuoteButton onQuote={() => onQuote(post)} disabled={isEditing} />
            )}
            {showBugBountyButton && (
              <AwardBugBountyButton
                postId={post.id}
                authorId={post.author.id}
                isConfirmed={post.has_achievement ?? false}
              />
            )}
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                title="Bearbeiten"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && <PostDeleteButton postId={post.id} />}
          </div>
        )}
      </div>

      {isEditing ? (
        <PostEditForm
          post={post}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <>
          {post.quoted_post && (
            <QuotedPostDisplay quotedPost={post.quoted_post} />
          )}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </>
      )}
    </div>
  );
}
