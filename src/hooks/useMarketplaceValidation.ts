import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface CanCreateMarketplaceOfferResponse {
  can_create: boolean;
  reason?: 'messages_disabled' | 'strangers_disabled';
  message?: string;
  has_active_offers?: boolean;
  active_offers_count?: number;
  offers_by_type?: {
    book_offers: number;
  };
}

interface ActiveMarketplaceOffersCountResponse {
  total_count: number;
  book_offers: number;
}

export function useCanCreateMarketplaceOffer() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<CanCreateMarketplaceOfferResponse>({
    queryKey: ['marketplace', 'can-create-offer'],
    queryFn: () => apiClient.transactions.canCreateMarketplaceOffer(),
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}

export function useActiveMarketplaceOffersCount() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<ActiveMarketplaceOffersCountResponse>({
    queryKey: ['marketplace', 'active-offers-count'],
    queryFn: () => apiClient.transactions.getActiveMarketplaceOffersCount(),
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}
