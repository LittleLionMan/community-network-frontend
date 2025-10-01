'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/forum/PostCard';
import { PostListSkeleton } from '@/components/forum/Skeletons';
import { useMyPosts } from '@/hooks/useDiscussions';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyPostsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: posts, isLoading, error, refetch } = useMyPosts();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/forum/my/posts');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-community-200 border-t-community-600"></div>
            <p className="text-gray-600">Wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Forum
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">Meine Posts</h1>
          <p className="mt-2 text-gray-600">Alle deine Antworten in Threads</p>
        </div>

        <PostListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Forum
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">Meine Posts</h1>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fehler beim Laden
          </h3>
          <p className="mb-4 text-gray-600">
            Deine Posts konnten nicht geladen werden. Bitte versuche es erneut.
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
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/forum" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Forum
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Meine Posts</h1>
        <p className="mt-2 text-gray-600">Alle deine Antworten in Threads</p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id}>
              <PostCard
                post={post}
                canEdit={user?.id === post.author.id}
                canDelete={false}
              />
              <div className="mt-2 text-sm text-gray-500">
                In Thread:{' '}
                <Link
                  href={`/forum/threads/${post.thread_id}`}
                  className="text-community-600 hover:underline"
                >
                  Zum Thread
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Noch keine Posts
          </h3>
          <p className="text-gray-600">
            Du hast noch keine Antworten in Threads verfasst.
          </p>
        </div>
      )}
    </div>
  );
}
