'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  TransactionCreateRequest,
  TransactionAcceptRequest,
  TransactionRejectRequest,
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
    },
  });
}

export function useAcceptTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data = {},
    }: {
      transactionId: number;
      data?: TransactionAcceptRequest;
    }) => apiClient.transactions.accept(transactionId, data),
    onSuccess: (updatedTransaction: TransactionData) => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', updatedTransaction.transaction_id],
      });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user'] });
    },
  });
}

export function useRejectTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: number;
      data: TransactionRejectRequest;
    }) => apiClient.transactions.reject(transactionId, data),
    onSuccess: (updatedTransaction: TransactionData) => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', updatedTransaction.transaction_id],
      });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user'] });
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
    },
  });
}
