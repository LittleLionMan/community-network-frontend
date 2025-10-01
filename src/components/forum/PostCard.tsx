'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { PostEditForm } from '@/components/forum/PostEditForm';
import { PostDeleteButton } from '@/components/forum/PostDeleteButton';
import { formatAbsolute } from '@/lib/forum-utils';
import type { ForumPost } from '@/types/forum';

interface PostCardProps {
  post: ForumPost;
  canEdit: boolean;
  canDelete: boolean;
}

export function PostCard({ post, canEdit, canDelete }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
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

        {(canEdit || canDelete) && !isEditing && (
          <div className="flex gap-2">
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
        <div className="prose max-w-none">
          <p className="whitespace-pre-line text-gray-700">{post.content}</p>
        </div>
      )}
    </div>
  );
}
