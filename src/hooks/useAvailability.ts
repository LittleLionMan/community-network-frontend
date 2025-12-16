'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type {
  AvailabilitySlotCreate,
  AvailabilitySlotUpdate,
} from '@/types/availability';

export function useMyAvailability(includeInactive = false) {
  return useQuery({
    queryKey: ['availability', 'my', includeInactive],
    queryFn: () => apiClient.availability.getMySlots(includeInactive),
    staleTime: 30000,
  });
}

export function useUserAvailability(
  userId: number,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['availability', 'user', userId, startDate, endDate],
    queryFn: () =>
      apiClient.availability.getUserAvailability(userId, startDate, endDate),
    staleTime: 60000,
    enabled: !!userId,
  });
}

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AvailabilitySlotCreate) =>
      apiClient.availability.createSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'my'] });
      toast.success(
        'Verfügbarkeit hinzugefügt',
        'Deine Verfügbarkeit wurde erfolgreich gespeichert.'
      );
    },
    onError: (error) => {
      toast.error(
        'Fehler',
        error instanceof Error
          ? error.message
          : 'Verfügbarkeit konnte nicht gespeichert werden.'
      );
    },
  });
}

export function useUpdateAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slotId,
      data,
    }: {
      slotId: number;
      data: AvailabilitySlotUpdate;
    }) => apiClient.availability.updateSlot(slotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'my'] });
      toast.success(
        'Verfügbarkeit aktualisiert',
        'Deine Verfügbarkeit wurde erfolgreich aktualisiert.'
      );
    },
    onError: (error) => {
      toast.error(
        'Fehler',
        error instanceof Error
          ? error.message
          : 'Verfügbarkeit konnte nicht aktualisiert werden.'
      );
    },
  });
}

export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slotId,
      hardDelete = false,
    }: {
      slotId: number;
      hardDelete?: boolean;
    }) => apiClient.availability.deleteSlot(slotId, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'my'] });
      toast.success(
        'Verfügbarkeit gelöscht',
        'Deine Verfügbarkeit wurde erfolgreich entfernt.'
      );
    },
    onError: (error) => {
      toast.error(
        'Fehler',
        error instanceof Error
          ? error.message
          : 'Verfügbarkeit konnte nicht gelöscht werden.'
      );
    },
  });
}

export function useCheckAvailability(
  userId: number,
  proposedTime: string,
  durationHours = 1
) {
  return useQuery({
    queryKey: ['availability', 'check', userId, proposedTime, durationHours],
    queryFn: () =>
      apiClient.availability.checkAvailability(
        userId,
        proposedTime,
        durationHours
      ),
    enabled: !!userId && !!proposedTime,
    staleTime: 10000,
  });
}
