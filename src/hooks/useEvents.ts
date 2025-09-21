import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface EventSummary {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
  creator: {
    id: number;
    display_name: string;
    profile_image_url?: string;
  };
  category: {
    id: number;
    name: string;
    description?: string;
  };
  participant_count: number;
  is_full?: boolean;
}

interface EventDetail extends EventSummary {
  created_at: string;
  creator_id: number;
  category_id: number;
  is_active: boolean;
}

interface EventParticipant {
  id: number;
  user: {
    id: number;
    display_name: string;
    profile_image_url?: string;
  };
  status: string;
  registered_at: string;
}

interface EventsParams {
  skip?: number;
  limit?: number;
  category_id?: number;
  upcoming_only?: boolean;
}

interface EventCreateData {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
  category_id: number;
}

interface CivicEventCreateData {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
}

export function useEvents(
  params: EventsParams & {
    political_only?: boolean;
    exclude_political?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      return (await apiClient.events.list(searchParams)) as EventSummary[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCivicEvents(
  params: Omit<EventsParams, 'political_only' | 'exclude_political'> = {}
) {
  return useQuery({
    queryKey: ['events', 'civic', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      return (await apiClient.events.getCivicEvents(
        searchParams
      )) as EventSummary[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRegularEvents(
  params: Omit<EventsParams, 'political_only' | 'exclude_political'> = {}
) {
  return useQuery({
    queryKey: ['events', 'regular', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      return (await apiClient.events.getRegularEvents(
        searchParams
      )) as EventSummary[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCivicEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CivicEventCreateData) => {
      return apiClient.events.createCivic(eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'civic'] });
    },
  });
}

export function useEvent(eventId: number | null) {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID required');
      return (await apiClient.events.get(eventId)) as EventDetail;
    },
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useEventCategories() {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => {
      return (await apiClient.eventCategories.list()) as Array<{
        id: number;
        name: string;
        description?: string;
      }>;
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useAdminEventCategories() {
  return useQuery({
    queryKey: ['admin-event-categories'],
    queryFn: async () => {
      return await apiClient.admin.eventCategories.list();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEventCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await apiClient.admin.eventCategories.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-categories'] });
      queryClient.invalidateQueries({ queryKey: ['event-categories'] });
    },
  });
}

export function useUpdateEventCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; description?: string };
    }) => {
      return await apiClient.admin.eventCategories.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-categories'] });
      queryClient.invalidateQueries({ queryKey: ['event-categories'] });
    },
  });
}

export function useDeleteEventCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.admin.eventCategories.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-categories'] });
      queryClient.invalidateQueries({ queryKey: ['event-categories'] });
    },
  });
}

export function useCreateDefaultCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await apiClient.admin.eventCategories.createDefaults();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-categories'] });
      queryClient.invalidateQueries({ queryKey: ['event-categories'] });
    },
  });
}

export function useEventParticipants(eventId: number | null) {
  return useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID required');
      return (await apiClient.request(
        `/api/events/${eventId}/participants`
      )) as EventParticipant[];
    },
    enabled: !!eventId,
    staleTime: 30 * 1000,
  });
}

export function useParticipationStatus(
  eventId: number | null,
  userId: number | null
) {
  const participantsQuery = useEventParticipants(eventId);

  const isParticipating =
    participantsQuery.data?.some((p) => p.user.id === userId) ?? false;

  return {
    isParticipating,
    participants: participantsQuery.data,
    isLoading: participantsQuery.isLoading,
    error: participantsQuery.error,
    refetch: participantsQuery.refetch,
  };
}

export function useJoinEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      return await apiClient.events.join(eventId);
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({
        queryKey: ['event-participants', eventId],
      });
    },
    onError: (error) => {
      console.error('Join event error:', error);
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      return await apiClient.events.leave(eventId);
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({
        queryKey: ['event-participants', eventId],
      });
    },
    onError: (error) => {
      console.error('Leave event error:', error);
    },
  });
}
