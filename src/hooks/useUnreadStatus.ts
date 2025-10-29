import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function useUnreadStatus(threadIds: number[]) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['unread-status', threadIds],
    queryFn: () => apiClient.discussions.getUnreadStatus(threadIds),
    enabled: threadIds.length > 0 && isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useMarkThreadAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: number) =>
      apiClient.discussions.markThreadAsRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-status'] });
      queryClient.invalidateQueries({
        queryKey: ['forum-category-unread-counts'],
      });
    },
  });
}
