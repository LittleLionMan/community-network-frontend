'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryFormModal } from '@/components/forum/CategoryFormModal';
import { CategoryListSkeleton } from '@/components/forum/Skeletons';
import {
  useForumCategories,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useForumCategories';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DynamicIcon } from '@/lib/forum-utils';
import type { ForumCategory } from '@/types/forum';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: categories, isLoading } = useForumCategories(true);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push('/forum');
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleToggleActive = async (category: ForumCategory) => {
    await updateCategory.mutateAsync({
      categoryId: category.id,
      data: { is_active: !category.is_active },
    });
  };

  const handleDelete = async (categoryId: number) => {
    if (
      confirm(
        'Kategorie wirklich löschen? Dies ist nur möglich, wenn keine Threads vorhanden sind.'
      )
    ) {
      await deleteCategory.mutateAsync(categoryId);
    }
  };

  if (authLoading || !isAuthenticated || !user?.is_admin) {
    return null;
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

          <h1 className="text-3xl font-bold text-gray-900">
            Kategorien verwalten
          </h1>
          <p className="mt-2 text-gray-600">
            Erstelle und verwalte Forum-Kategorien
          </p>
        </div>

        <CategoryListSkeleton />
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Kategorien verwalten
            </h1>
            <p className="mt-2 text-gray-600">
              Erstelle und verwalte Forum-Kategorien
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Neue Kategorie
          </Button>
        </div>
      </div>

      {categories && categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: category.color || '#E5E7EB' }}
                >
                  <DynamicIcon
                    name={category.icon}
                    className="h-6 w-6 text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    {!category.is_active && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    {category.thread_count} Threads • Reihenfolge:{' '}
                    {category.display_order}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(category)}
                  disabled={updateCategory.isPending}
                  title={category.is_active ? 'Deaktivieren' : 'Aktivieren'}
                >
                  {category.is_active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                  title="Bearbeiten"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  disabled={
                    deleteCategory.isPending || category.thread_count > 0
                  }
                  className="text-red-600 hover:bg-red-50 disabled:opacity-50"
                  title={
                    category.thread_count > 0
                      ? 'Löschen nicht möglich - Kategorie enthält Threads'
                      : 'Löschen'
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="mb-4 text-gray-600">Noch keine Kategorien vorhanden.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Erste Kategorie erstellen
          </Button>
        </div>
      )}

      {showCreateModal && (
        <CategoryFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingCategory && (
        <CategoryFormModal
          mode="edit"
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}
