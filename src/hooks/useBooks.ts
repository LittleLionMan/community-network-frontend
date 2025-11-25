'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, BookOfferCreate, BookOfferUpdate } from '@/lib/api';
import { toast } from '@/components/ui/toast';

export function useMarketplace(filters?: {
  search?: string;
  condition?: string[];
  language?: string;
  category?: string;
  max_distance_km?: number;
  district?: string;
  has_comments?: boolean;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['books', 'marketplace', filters],
    queryFn: () => apiClient.books.getMarketplace(filters),
    staleTime: 30000,
  });
}

export function useMyOffers(
  statusFilter?: 'active' | 'reserved' | 'completed'
) {
  return useQuery({
    queryKey: ['books', 'my-offers', statusFilter],
    queryFn: () => apiClient.books.getMyOffers(statusFilter),
  });
}

export function useBookStats() {
  return useQuery({
    queryKey: ['books', 'stats'],
    queryFn: () => apiClient.books.getStats(),
    staleTime: 60000,
  });
}

export function useBookSearch(isbn: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['books', 'search', isbn],
    queryFn: () => apiClient.books.searchByISBN(isbn),
    enabled: enabled && isbn.length >= 10,
    retry: false,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookOfferCreate) => apiClient.books.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'stats'] });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      offerId,
      data,
    }: {
      offerId: number;
      data: BookOfferUpdate;
    }) => apiClient.books.updateOffer(offerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'marketplace'] });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => apiClient.books.deleteOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'stats'] });
      toast.success(
        'Angebot gelöscht',
        'Dein Angebot wurde erfolgreich gelöscht.'
      );
    },
    onError: (error) => {
      toast.error(
        'Fehler',
        error instanceof Error
          ? error.message
          : 'Angebot konnte nicht gelöscht werden.'
      );
    },
  });
}

export function useDeleteOfferComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) =>
      apiClient.books.deleteOfferComment(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'marketplace'] });
      toast.success(
        'Kommentar gelöscht',
        'Dein Kommentar wurde erfolgreich gelöscht.'
      );
    },
  });
}
