'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, BookOfferCreate, BookOfferUpdate } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useMarketplace(filters?: {
  book_id?: number;
  search?: string;
  condition?: string[];
  language?: string[];
  genre?: string[];
  topic?: string[];
  max_distance_km?: number;
  district?: string[];
  has_comments?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ['books', 'marketplace', filters],
    queryFn: ({ pageParam = 0 }) =>
      apiClient.books.getMarketplace({
        ...filters,
        skip: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.skip + lastPage.limit : undefined,
    initialPageParam: 0,
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

export function useFilterOptions(lang: string = 'de') {
  return useQuery({
    queryKey: ['books', 'filter-options', lang],
    queryFn: () => apiClient.books.getFilterOptions(lang),
    staleTime: 600000,
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
