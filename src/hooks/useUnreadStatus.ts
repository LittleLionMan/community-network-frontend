import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function useUnreadStatus(threadIds: number[]) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['unread-status', threadIds],
    queryFn: async () => {
      if (threadIds.length === 0) return {};

      const params = new URLSearchParams();
      threadIds.forEach((id) => params.append('thread_ids', id.toString()));

      const response = await apiClient.request<Record<number, boolean>>(
        `/api/discussions/unread-status?${params}`
      );

      return response;
    },
    enabled: threadIds.length > 0 && isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useMarkThreadAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: number) => {
      return await apiClient.request(`/api/discussions/${threadId}/mark-read`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-status'] });
    },
  });
}
