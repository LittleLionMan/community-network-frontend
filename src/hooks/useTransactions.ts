'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  TransactionCreateRequest,
  TransactionProposeTimeRequest,
  TransactionConfirmTimeRequest,
  TransactionCancelRequest,
  TransactionConfirmHandoverRequest,
  TransactionData,
} from '@/types/transactions';

export function useTransaction(transactionId: number) {
  return useQuery({
    queryKey: ['transactions', transactionId],
    queryFn: () => apiClient.transactions.getById(transactionId),
    enabled: !!transactionId,
    staleTime: 10000,
  });
}

export function useUserTransactions(status?: string, limit = 50) {
  return useQuery({
    queryKey: ['transactions', 'user', status, limit],
    queryFn: () => apiClient.transactions.getUserTransactions(status, limit),
    staleTime: 30000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      data,
    }: {
      providerId: number;
      data: TransactionCreateRequest;
    }) => apiClient.transactions.create(providerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'stats'] });
    },
  });
}

export function useProposeTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: number;
      data: TransactionProposeTimeRequest;
    }) => apiClient.transactions.proposeTime(transactionId, data),
    onSuccess: (updatedTransaction: TransactionData) => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', updatedTransaction.transaction_id],
      });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user'] });
    },
    onError: (error: Error) => {
      console.error('Failed to propose time:', error);
      if (error.message.includes('cannot be updated')) {
        alert(
          'Diese Transaktion kann nicht mehr bearbeitet werden (abgelaufen oder bereits abgeschlossen).'
        );
      }
    },
  });
}

export function useAvailableRequestSlots() {
  return useQuery({
    queryKey: ['available-request-slots'],
    queryFn: () => apiClient.transactions.getAvailableRequestSlots(),
    staleTime: 30000,
  });
}

export function useUpdateTransactionAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      address,
    }: {
      transactionId: number;
      address: string;
    }) => {
      const validationResult = await apiClient.location.validate(address);

      if (!validationResult.valid || !validationResult.district) {
        throw new Error(
          validationResult.message || 'Standort konnte nicht validiert werden.'
        );
      }

      return apiClient.transactions.updateAddress(transactionId, {
        exact_address: address,
        location_district: validationResult.district,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useConfirmTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: number;
      data: TransactionConfirmTimeRequest;
    }) => apiClient.transactions.confirmTime(transactionId, data),
    onSuccess: (updatedTransaction: TransactionData) => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', updatedTransaction.transaction_id],
      });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error: Error) => {
      console.error('Failed to confirm time:', error);
      if (error.message.includes('cannot be updated')) {
        alert(
          'Diese Transaktion kann nicht mehr bearbeitet werden (abgelaufen oder bereits abgeschlossen).'
        );
      } else if (error.message.includes('not available')) {
        alert('Der Anbieter ist zu diesem Zeitpunkt nicht verfügbar.');
      }
    },
  });
}

export function useConfirmHandover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data = {},
    }: {
      transactionId: number;
      data?: TransactionConfirmHandoverRequest;
    }) => apiClient.transactions.confirmHandover(transactionId, data),
    onSuccess: (updatedTransaction: TransactionData) => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', updatedTransaction.transaction_id],
      });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['available-request-slots'] });
    },
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data = {},
    }: {
      transactionId: number;
      data?: TransactionCancelRequest;
    }) => apiClient.transactions.cancel(transactionId, data),
    onSuccess: (updatedTransaction: TransactionData) => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', updatedTransaction.transaction_id],
      });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'my-offers'] });
    },
  });
}
