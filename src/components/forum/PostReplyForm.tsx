'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreatePost } from '@/hooks/useDiscussions';
import { Send, RefreshCw } from 'lucide-react';

interface PostReplyFormProps {
  threadId: number;
  onSuccess?: () => void;
}

export function PostReplyForm({ threadId, onSuccess }: PostReplyFormProps) {
  const [content, setContent] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      await createPost.mutateAsync({
        threadId,
        content: content.trim(),
      });
      setContent('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <h3 className="mb-4 font-semibold text-gray-900">Antworten</h3>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-community-500 focus:outline-none focus:ring-2 focus:ring-community-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Schreibe deine Antwort..."
          disabled={createPost.isPending}
          required
          minLength={1}
          maxLength={5000}
        />
        <p className="mt-1 text-xs text-gray-500">
          {content.length}/5000 Zeichen
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createPost.isPending || !content.trim()}
          className="flex items-center gap-2"
        >
          {createPost.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Wird gepostet...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Antworten
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
