import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { MessagePrivacySettings } from '@/types/message';

export function useMessagePrivacy() {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['message-privacy-settings'],
    queryFn: () => apiClient.messages.getPrivacySettings(),
    staleTime: 5 * 60 * 1000, // 5 Minuten
    enabled: isAuthenticated && !!user,
    initialData: {
      messages_enabled: true,
      messages_from_strangers: true,
      messages_notifications: true,
    },
  });
}

export function useUpdateMessagePrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<MessagePrivacySettings>) =>
      apiClient.messages.updatePrivacySettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['message-privacy-settings'], data);
    },
  });
}
