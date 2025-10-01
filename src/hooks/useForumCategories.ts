import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type {
  ForumCategory,
  ForumCategoryCreate,
  ForumCategoryUpdate,
} from '@/types/forum';

export function useForumCategories(includeInactive = false) {
  return useQuery({
    queryKey: ['forum-categories', includeInactive],
    queryFn: async () => {
      return (await apiClient.forumCategories.list(
        includeInactive
      )) as ForumCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useForumCategory(categoryId: number | null) {
  return useQuery({
    queryKey: ['forum-category', categoryId],
    queryFn: async () => {
      if (!categoryId) throw new Error('Category ID required');
      return (await apiClient.forumCategories.get(categoryId)) as ForumCategory;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ForumCategoryCreate) => {
      return await apiClient.forumCategories.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success(
        'Kategorie erstellt',
        'Die neue Kategorie wurde erfolgreich erstellt.'
      );
    },
    onError: (error) => {
      console.error('Create category error:', error);
      toast.error(
        'Fehler',
        'Kategorie konnte nicht erstellt werden. Bitte versuche es erneut.'
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: number;
      data: ForumCategoryUpdate;
    }) => {
      return await apiClient.forumCategories.update(categoryId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      queryClient.invalidateQueries({
        queryKey: ['forum-category', variables.categoryId],
      });
      toast.success(
        'Kategorie aktualisiert',
        'Die Änderungen wurden erfolgreich gespeichert.'
      );
    },
    onError: (error) => {
      console.error('Update category error:', error);
      toast.error(
        'Fehler',
        'Kategorie konnte nicht aktualisiert werden. Bitte versuche es erneut.'
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiClient.forumCategories.delete(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success(
        'Kategorie gelöscht',
        'Die Kategorie wurde erfolgreich entfernt.'
      );
    },
    onError: (error: unknown) => {
      console.error('Delete category error:', error);

      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 409
      ) {
        toast.error(
          'Kategorie nicht leer',
          'Diese Kategorie enthält noch Threads und kann nicht gelöscht werden.'
        );
      } else {
        toast.error(
          'Fehler',
          'Kategorie konnte nicht gelöscht werden. Bitte versuche es erneut.'
        );
      }
    },
  });
}
