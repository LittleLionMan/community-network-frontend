'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreadCreateForm } from '@/components/forum/ThreadCreateForm';
import { useForumCategories } from '@/hooks/useForumCategories';
import { useAuthStore } from '@/store/auth';
import { useEffect, Suspense } from 'react';

function ThreadCreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');

  const { isAuthenticated, isLoading } = useAuthStore();
  const { data: categories } = useForumCategories();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/forum/threads/create');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
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

  if (!isAuthenticated) {
    return null;
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

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-community-100">
              <Plus className="h-6 w-6 text-community-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Neuen Thread erstellen
            </h1>
            <p className="mt-2 text-gray-600">
              Starte eine neue Diskussion in der Community
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <ThreadCreateForm
              categories={categories || []}
              defaultCategoryId={categoryId ? parseInt(categoryId) : undefined}
              onSuccess={(threadId) =>
                router.push(`/forum/threads/${threadId}`)
              }
              onCancel={() => router.back()}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <h3 className="mb-3 font-medium text-blue-900">
                    Diskussions-Richtlinien
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Respektvoller Umgangston</li>
                    <li>• Konstruktive Beiträge</li>
                    <li>• Keine Spam-Posts</li>
                    <li>• Relevante Inhalte teilen</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">
                Thread Richtlinien
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Titel:</span>
                  <span>3-200 Zeichen</span>
                </div>
                <div className="flex justify-between">
                  <span>Kategorie:</span>
                  <span>Erforderlich</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThreadCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-community-200 border-t-community-600"></div>
              <p className="text-gray-600">Wird geladen...</p>
            </div>
          </div>
        </div>
      }
    >
      <ThreadCreatePageContent />
    </Suspense>
  );
}
