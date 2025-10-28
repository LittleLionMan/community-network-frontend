import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { NotificationType } from '@/types/notification';

interface GetNotificationsParams {
  skip?: number;
  limit?: number;
  unread_only?: boolean;
  type_filter?: NotificationType;
}

export function useNotificationStats(enabled = true) {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => apiClient.notifications.getStats(),
    staleTime: 30000,
    enabled,
  });
}

export function useNotifications(params: GetNotificationsParams = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => apiClient.notifications.list(params),
    staleTime: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notificationId,
      isRead,
    }: {
      notificationId: number;
      isRead: boolean;
    }) => {
      return apiClient.notifications.update(notificationId, {
        is_read: isRead,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeFilter?: NotificationType) => {
      return apiClient.notifications.markAllAsRead(typeFilter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      return apiClient.notifications.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

export function useInvalidateNotifications() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
  };
}
