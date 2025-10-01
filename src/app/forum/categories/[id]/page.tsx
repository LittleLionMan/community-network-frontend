'use client';

import { use } from 'react';
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
import { useForumCategory } from '@/hooks/useForumCategories';
import { useCategoryThreads } from '@/hooks/useDiscussions';
import { useAuthStore } from '@/store/auth';

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const categoryId = parseInt(resolvedParams.id);
  const { isAuthenticated } = useAuthStore();

  const { data: category, isLoading: categoryLoading } =
    useForumCategory(categoryId);
  const {
    data: threads,
    isLoading: threadsLoading,
    error,
    refetch,
  } = useCategoryThreads(categoryId);

  const isLoading = categoryLoading || threadsLoading;

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
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
        </div>

        <ThreadListSkeleton />
      </div>
    );
  }

  if (error || !category) {
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
            Kategorie nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600">
            Die Kategorie konnte nicht geladen werden oder existiert nicht.
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
        <span className="text-gray-900">{category.name}</span>
      </nav>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-600">{category.description}</p>
          )}
        </div>

        {isAuthenticated && (
          <Button asChild>
            <Link
              href={`/forum/threads/create?category=${categoryId}`}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Neuer Thread
            </Link>
          </Button>
        )}
      </div>

      {threads && threads.length > 0 ? (
        <div className="space-y-2">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Noch keine Threads
          </h3>
          <p className="mb-4 text-gray-600">
            Sei der Erste und starte eine Diskussion!
          </p>
          {isAuthenticated && (
            <Button asChild>
              <Link href={`/forum/threads/create?category=${categoryId}`}>
                Ersten Thread erstellen
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
