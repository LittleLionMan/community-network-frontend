import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type {
  ForumThread,
  ForumPost,
  ForumThreadCreate,
  ForumThreadUpdate,
  ThreadPostsParams,
} from '@/types/forum';

export function useCategoryThreads(categoryId: number | null) {
  return useQuery({
    queryKey: ['category-threads', categoryId],
    queryFn: async () => {
      if (!categoryId) throw new Error('Category ID required');
      return (await apiClient.discussions.list({
        category_id: categoryId,
        pinned_first: true,
      })) as ForumThread[];
    },
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useThread(threadId: number | null) {
  return useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!threadId) throw new Error('Thread ID required');
      return (await apiClient.discussions.get(threadId)) as ForumThread;
    },
    enabled: !!threadId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ForumThreadCreate) => {
      return await apiClient.discussions.create(data);
    },
    onSuccess: (data: unknown, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['category-threads', variables.category_id],
      });
      toast.success('Thread erstellt', 'Dein Thread wurde veröffentlicht.');
    },
    onError: (error: unknown) => {
      console.error('Create thread error:', error);

      if (error instanceof Error && error.message.includes('flagged')) {
        toast.error(
          'Inhalt nicht erlaubt',
          'Der Thread-Titel enthält nicht erlaubte Inhalte. Bitte überarbeite ihn.'
        );
      } else {
        toast.error(
          'Fehler',
          'Thread konnte nicht erstellt werden. Bitte versuche es erneut.'
        );
      }
    },
  });
}

export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      data,
    }: {
      threadId: number;
      data: ForumThreadUpdate;
    }) => {
      return await apiClient.discussions.update(threadId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['thread', variables.threadId],
      });
      queryClient.invalidateQueries({ queryKey: ['category-threads'] });
      toast.success('Thread aktualisiert');
    },
    onError: (error: unknown) => {
      console.error('Update thread error:', error);

      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 403
      ) {
        toast.error(
          'Keine Berechtigung',
          'Du bist nicht berechtigt, diesen Thread zu bearbeiten.'
        );
      } else {
        toast.error(
          'Fehler',
          'Thread konnte nicht aktualisiert werden. Bitte versuche es erneut.'
        );
      }
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: number) => {
      return await apiClient.discussions.delete(threadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-threads'] });
      queryClient.invalidateQueries({ queryKey: ['my-threads'] });
      toast.success('Thread gelöscht');
    },
    onError: (error: unknown) => {
      console.error('Delete thread error:', error);

      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 403
      ) {
        toast.error(
          'Keine Berechtigung',
          'Du bist nicht berechtigt, diesen Thread zu löschen.'
        );
      } else {
        toast.error(
          'Fehler',
          'Thread konnte nicht gelöscht werden. Bitte versuche es erneut.'
        );
      }
    },
  });
}

export function useThreadPosts(threadId: number | null) {
  return useQuery({
    queryKey: ['thread-posts', threadId],
    queryFn: async () => {
      if (!threadId) throw new Error('Thread ID required');
      return (await apiClient.discussions.getThreadPosts(
        threadId
      )) as ForumPost[];
    },
    enabled: !!threadId,
    staleTime: 30 * 1000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      content,
      quoted_post_id,
    }: {
      threadId: number;
      content: string;
      quoted_post_id?: number | null;
    }) => {
      return await apiClient.discussions.createPost(threadId, {
        content,
        quoted_post_id,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['thread-posts', variables.threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ['thread', variables.threadId],
      });
      toast.success('Antwort gepostet');
    },
    onError: (error: unknown) => {
      console.error('Create post error:', error);

      if (error instanceof Error) {
        if (error.message.includes('flagged')) {
          toast.error(
            'Inhalt nicht erlaubt',
            'Dein Post enthält nicht erlaubte Inhalte. Bitte überarbeite ihn.'
          );
        } else if (error.message.includes('locked')) {
          toast.error(
            'Thread gesperrt',
            'Dieser Thread ist gesperrt. Keine neuen Antworten möglich.'
          );
        } else {
          toast.error(
            'Fehler',
            'Post konnte nicht erstellt werden. Bitte versuche es erneut.'
          );
        }
      } else {
        toast.error(
          'Fehler',
          'Post konnte nicht erstellt werden. Bitte versuche es erneut.'
        );
      }
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: number;
      content: string;
    }) => {
      return await apiClient.discussions.updatePost(postId, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-posts'] });
      toast.success('Post aktualisiert');
    },
    onError: (error: unknown) => {
      console.error('Update post error:', error);

      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 403
      ) {
        toast.error(
          'Keine Berechtigung',
          'Du bist nicht berechtigt, diesen Post zu bearbeiten.'
        );
      } else {
        toast.error(
          'Fehler',
          'Post konnte nicht aktualisiert werden. Bitte versuche es erneut.'
        );
      }
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      return await apiClient.discussions.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      toast.success('Post gelöscht');
    },
    onError: (error: unknown) => {
      console.error('Delete post error:', error);

      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 403
      ) {
        toast.error(
          'Keine Berechtigung',
          'Du bist nicht berechtigt, diesen Post zu löschen.'
        );
      } else {
        toast.error(
          'Fehler',
          'Post konnte nicht gelöscht werden. Bitte versuche es erneut.'
        );
      }
    },
  });
}

export function useMyThreads() {
  return useQuery({
    queryKey: ['my-threads'],
    queryFn: async () => {
      return (await apiClient.discussions.getMyThreads()) as ForumThread[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useMyPosts() {
  return useQuery({
    queryKey: ['my-posts'],
    queryFn: async () => {
      return (await apiClient.discussions.getMyPosts()) as ForumPost[];
    },
    staleTime: 2 * 60 * 1000,
  });
}
