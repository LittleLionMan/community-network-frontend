'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/forum/RichTextEditor';
import { QuotedPostPreview } from '@/components/forum/QuotedPostPreview';
import { useCreatePost } from '@/hooks/useDiscussions';
import { Send, RefreshCw } from 'lucide-react';
import type { ForumPost } from '@/types/forum';

interface PostReplyFormProps {
  threadId: number;
  quotedPost?: ForumPost | null;
  onClearQuote?: () => void;
  onSuccess?: () => void;
}

export function PostReplyForm({
  threadId,
  quotedPost,
  onClearQuote,
  onSuccess,
}: PostReplyFormProps) {
  const [content, setContent] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const createPost = useCreatePost();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (quotedPost && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [quotedPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      return;
    }

    try {
      await createPost.mutateAsync({
        threadId,
        content: content.trim(),
        quoted_post_id: quotedPost?.id || null,
      });
      setContent('');
      setResetKey((prev) => prev + 1);
      if (onClearQuote) {
        onClearQuote();
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const textLength = content.replace(/<[^>]*>/g, '').length;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <h3 className="mb-4 font-semibold text-gray-900">Antworten</h3>

      {quotedPost && onClearQuote && (
        <QuotedPostPreview post={quotedPost} onRemove={onClearQuote} />
      )}

      <div className="mb-4">
        <RichTextEditor
          key={resetKey}
          content={content}
          onChange={setContent}
          placeholder="Schreibe deine Antwort..."
          disabled={createPost.isPending}
        />
        <p className="mt-1 text-xs text-gray-500">{textLength}/5000 Zeichen</p>
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
