'use client';

import Link from 'next/link';
import { Settings, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/forum/CategoryCard';
import { CategoryListSkeleton } from '@/components/forum/Skeletons';
import {
  useForumCategories,
  useUnreadCategoryCounts,
} from '@/hooks/useForumCategories';
import { useAuthStore } from '@/store/auth';

export default function ForumPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: categories, isLoading, error, refetch } = useForumCategories();
  const { data: unreadCounts } = useUnreadCategoryCounts();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agora</h1>
          <p className="mt-2 text-gray-600">
            Diskutiere über die Plattform, Features und Community-Governance
          </p>
        </div>
        <CategoryListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agora</h1>
          <p className="mt-2 text-gray-600">
            Diskutiere über die Plattform, Features und Community-Governance
          </p>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fehler beim Laden der Kategorien
          </h3>
          <p className="mb-4 text-gray-600">
            Die Kategorien konnten nicht geladen werden. Bitte versuche es
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agora</h1>
            <p className="mt-2 text-gray-600">
              Diskutiere über die Plattform, Features und Community-Governance
            </p>
          </div>

          {user?.is_admin && (
            <Button asChild>
              <Link
                href="/forum/admin/categories"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Kategorien verwalten
              </Link>
            </Button>
          )}
        </div>
      </div>

      {categories && categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              unreadCount={
                isAuthenticated && unreadCounts
                  ? unreadCounts[category.id.toString()] || 0
                  : 0
              }
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Noch keine Kategorien
          </h3>
          <p className="text-gray-600">
            Es wurden noch keine Forum-Kategorien erstellt.
          </p>
          {user?.is_admin && (
            <Button asChild className="mt-4">
              <Link href="/forum/admin/categories">
                Erste Kategorie erstellen
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
