'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/forum/RichTextEditor';
import { useUpdatePost } from '@/hooks/useDiscussions';
import { Save, X, RefreshCw } from 'lucide-react';
import type { ForumPost } from '@/types/forum';

interface PostEditFormProps {
  post: ForumPost;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PostEditForm({ post, onSuccess, onCancel }: PostEditFormProps) {
  const [content, setContent] = useState(post.content);
  const updatePost = useUpdatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      return;
    }

    try {
      await updatePost.mutateAsync({
        postId: post.id,
        content: content.trim(),
      });
      onSuccess();
    } catch (error) {
      // Error handled by hook
    }
  };

  const textLength = content.replace(/<[^>]*>/g, '').length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Schreibe deine Antwort..."
          disabled={updatePost.isPending}
        />
        <p className="mt-1 text-xs text-gray-500">{textLength}/5000 Zeichen</p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={updatePost.isPending || !content.trim()}
          className="flex items-center gap-2"
        >
          {updatePost.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Speichern
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updatePost.isPending}
        >
          <X className="mr-2 h-4 w-4" />
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
