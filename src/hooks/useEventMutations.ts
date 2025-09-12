import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface EventCreateData {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  max_participants?: number;
  category_id: number;
}

interface EventUpdateData extends Partial<EventCreateData> {
  is_active?: boolean;
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: EventCreateData) => {
      return await apiClient.request('/api/events/', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-categories'] });
    },
    onError: (error) => {
      console.error('Create event error:', error);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      eventData,
    }: {
      eventId: number;
      eventData: EventUpdateData;
    }) => {
      return await apiClient.events.update(eventId, eventData);
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
    },
    onError: (error) => {
      console.error('Update event error:', error);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      return await apiClient.request(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Delete event error:', error);
    },
  });
}
