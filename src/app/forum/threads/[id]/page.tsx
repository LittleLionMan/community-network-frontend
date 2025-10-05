'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Pin, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/forum/PostCard';
import { PostReplyForm } from '@/components/forum/PostReplyForm';
import { ThreadModActions } from '@/components/forum/ThreadModActions';
import { PostListSkeleton } from '@/components/forum/Skeletons';
import { useThread, useThreadPosts } from '@/hooks/useDiscussions';
import { useMarkThreadAsRead } from '@/hooks/useUnreadStatus';
import { useAuthStore } from '@/store/auth';
import type { ForumPost } from '@/types/forum';

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const resolvedParams = use(params);
  const threadId = parseInt(resolvedParams.id);
  const { user, isAuthenticated } = useAuthStore();
  const [quotedPost, setQuotedPost] = useState<ForumPost | null>(null);

  const { data: thread, isLoading: threadLoading } = useThread(threadId);
  const {
    data: posts,
    isLoading: postsLoading,
    error,
    refetch,
  } = useThreadPosts(threadId);

  const isLoading = threadLoading || postsLoading;
  const isCreator = user?.id === thread?.creator.id;
  const canModerate = user?.is_admin;

  const handleQuote = (post: ForumPost) => {
    setQuotedPost(post);
  };

  const handleClearQuote = () => {
    setQuotedPost(null);
  };

  const markAsRead = useMarkThreadAsRead();

  useEffect(() => {
    if (thread && isAuthenticated) {
      markAsRead.mutate(threadId);
    }
  }, [threadId, thread, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/forum" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Forum
            </Link>
          </Button>
        </div>

        <div className="mb-8 animate-pulse">
          <div className="h-8 w-3/4 rounded bg-gray-200"></div>
        </div>

        <PostListSkeleton />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/forum" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Forum
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Thread nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600">
            Der Thread konnte nicht geladen werden oder existiert nicht.
          </p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm">
        <Link href="/forum" className="text-community-600 hover:underline">
          Meta Forum
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link
          href={`/forum/categories/${thread.category.id}`}
          className="text-community-600 hover:underline"
        >
          {thread.category.name}
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{thread.title}</span>
      </nav>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {thread.is_pinned && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                <Pin className="mr-1 h-3 w-3" />
                Angepinnt
              </span>
            )}
            {thread.is_locked && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                <Lock className="mr-1 h-3 w-3" />
                Gesperrt
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{thread.title}</h1>
        </div>

        {(canModerate || isCreator) && <ThreadModActions thread={thread} />}
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post, index) => {
            const isFirstPost = index === 0;
            return (
              <PostCard
                key={post.id}
                post={post}
                canEdit={(user?.id === post.author.id || canModerate) ?? false}
                canDelete={
                  !isFirstPost &&
                  ((user?.id === post.author.id || canModerate) ?? false)
                }
                onQuote={
                  isAuthenticated && !thread.is_locked ? handleQuote : undefined
                }
                showQuoteButton={isAuthenticated && !thread.is_locked}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Keine Posts in diesem Thread.</p>
        </div>
      )}

      {isAuthenticated && !thread.is_locked && (
        <div className="mt-8">
          <PostReplyForm
            threadId={threadId}
            quotedPost={quotedPost}
            onClearQuote={handleClearQuote}
          />
        </div>
      )}

      {thread.is_locked && (
        <div className="mt-8 rounded-lg bg-yellow-50 p-4 text-center">
          <Lock className="mx-auto mb-2 h-6 w-6 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Dieser Thread ist gesperrt. Keine neuen Antworten möglich.
          </p>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-8 rounded-lg bg-gray-50 p-6 text-center">
          <p className="mb-4 text-gray-700">
            Du musst angemeldet sein, um zu antworten.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/auth/login">Anmelden</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Registrieren</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
