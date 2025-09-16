'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface Service {
  id: number;
  title: string;
  description: string;
  is_offering: boolean;
  is_active: boolean;
  created_at: string;
  user: {
    id: number;
    display_name: string;
    profile_image_url?: string;
    email_verified: boolean;
    created_at: string;
    location?: string;
    location_private: boolean;
  };
  service_image_url?: string;
}

export interface ServiceCreateData {
  title: string;
  description: string;
  is_offering: boolean;
  service_image?: File;
  meeting_locations?: string[];
}

export interface ServiceUpdateData {
  title?: string;
  description?: string;
  is_offering?: boolean;
  is_active?: boolean;
  service_image?: File;
  meeting_locations?: string[];
}

interface ServiceFilters {
  skip?: number;
  limit?: number;
  is_offering?: boolean;
  search?: string;
  exclude_own?: boolean;
}

interface ServiceStats {
  total_active_services: number;
  services_offered: number;
  services_requested: number;
  market_balance: number;
  user_stats?: {
    my_services: number;
    my_offerings: number;
    my_requests: number;
  };
}

export function useServices(filters: ServiceFilters = {}) {
  const [data, setData] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.skip !== undefined)
        params.append('skip', filters.skip.toString());
      if (filters.limit !== undefined)
        params.append('limit', filters.limit.toString());
      if (filters.is_offering !== undefined)
        params.append('is_offering', filters.is_offering.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.exclude_own) params.append('exclude_own', 'true');

      const response = await apiClient.services.list(params);
      setData(response as Service[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load services';
      setError(errorMessage);
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.skip,
    filters.limit,
    filters.is_offering,
    filters.search,
    filters.exclude_own,
  ]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchServices,
    isRefetching: isLoading,
  };
}

export function useMyServices(
  filters: Omit<ServiceFilters, 'exclude_own'> = {}
) {
  const [data, setData] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.skip !== undefined)
        params.append('skip', filters.skip.toString());
      if (filters.limit !== undefined)
        params.append('limit', filters.limit.toString());
      if (filters.is_offering !== undefined)
        params.append('is_offering', filters.is_offering.toString());

      const response = await apiClient.services.getMyServices(params);
      setData(response as Service[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load my services';
      setError(errorMessage);
      console.error('Failed to fetch my services:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters.skip, filters.limit, filters.is_offering]);

  useEffect(() => {
    fetchMyServices();
  }, [fetchMyServices]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMyServices,
    isRefetching: isLoading,
  };
}

export function useServiceRecommendations(limit: number = 10) {
  const [data, setData] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      const response = await apiClient.services.getRecommendations(params);
      setData(response as Service[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(errorMessage);
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}

export function useServiceStats() {
  const [data, setData] = useState<ServiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.services.getStats();
      setData(response as ServiceStats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load service stats';
      setError(errorMessage);
      console.error('Failed to fetch service stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

export function useServiceMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);

  const createService = useCallback(async (data: ServiceCreateData) => {
    try {
      setIsCreating(true);

      if (data.service_image) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('is_offering', data.is_offering.toString());
        formData.append('service_image', data.service_image);

        if (data.meeting_locations) {
          data.meeting_locations.forEach((location, index) => {
            formData.append(`meeting_locations[${index}]`, location);
          });
        }

        const response = await apiClient.services.createWithImage(formData);
        return response;
      } else {
        const response = await apiClient.services.create(data);
        return response;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create service';
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateService = useCallback(
    async (serviceId: number, data: ServiceUpdateData) => {
      try {
        setIsUpdating(true);

        if (data.service_image) {
          const formData = new FormData();
          if (data.title !== undefined) formData.append('title', data.title);
          if (data.description !== undefined)
            formData.append('description', data.description);
          if (data.is_offering !== undefined)
            formData.append('is_offering', data.is_offering.toString());
          if (data.is_active !== undefined)
            formData.append('is_active', data.is_active.toString());
          formData.append('service_image', data.service_image);

          if (data.meeting_locations) {
            data.meeting_locations.forEach((location, index) => {
              formData.append(`meeting_locations[${index}]`, location);
            });
          }

          const response = await apiClient.services.updateWithImage(
            serviceId,
            formData
          );
          return response;
        } else {
          const response = await apiClient.services.update(serviceId, data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update service';
        throw new Error(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const deleteService = useCallback(async (serviceId: number) => {
    try {
      setIsDeleting(true);
      await apiClient.services.delete(serviceId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete service';
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const expressInterest = useCallback(
    async (serviceId: number, message?: string) => {
      try {
        setIsExpressingInterest(true);
        const response = await apiClient.services.expressInterest(
          serviceId,
          message
        );
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to express interest';
        throw new Error(errorMessage);
      } finally {
        setIsExpressingInterest(false);
      }
    },
    []
  );

  return {
    createService,
    updateService,
    deleteService,
    expressInterest,
    isCreating,
    isUpdating,
    isDeleting,
    isExpressingInterest,
  };
}
