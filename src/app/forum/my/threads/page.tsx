'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreadCard } from '@/components/forum/ThreadCard';
import { ThreadListSkeleton } from '@/components/forum/Skeletons';
import { useMyThreads } from '@/hooks/useDiscussions';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyThreadsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: threads, isLoading, error, refetch } = useMyThreads();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/forum/my/threads');
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

          <h1 className="text-3xl font-bold text-gray-900">Meine Threads</h1>
          <p className="mt-2 text-gray-600">
            Alle Threads, die du erstellt hast
          </p>
        </div>

        <ThreadListSkeleton />
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

          <h1 className="text-3xl font-bold text-gray-900">Meine Threads</h1>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fehler beim Laden
          </h3>
          <p className="mb-4 text-gray-600">
            Deine Threads konnten nicht geladen werden. Bitte versuche es
            erneut.
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

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meine Threads</h1>
            <p className="mt-2 text-gray-600">
              Alle Threads, die du erstellt hast
            </p>
          </div>

          <Button asChild>
            <Link
              href="/forum/threads/create"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Neuer Thread
            </Link>
          </Button>
        </div>
      </div>

      {threads && threads.length > 0 ? (
        <div className="space-y-2">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} showCategory />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Noch keine Threads
          </h3>
          <p className="mb-4 text-gray-600">
            Du hast noch keine Threads erstellt.
          </p>
          <Button asChild>
            <Link href="/forum/threads/create">Ersten Thread erstellen</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
