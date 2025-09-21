import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

import type { PollCreateData, PollUpdateData } from '@/lib/api';

export interface PollFilters {
  skip?: number;
  limit?: number;
  poll_type?: 'thread' | 'admin';
  active_only?: boolean;
  thread_id?: number;
}

export function usePolls(filters: PollFilters = {}) {
  return useQuery({
    queryKey: ['polls', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      return apiClient.polls.list(params);
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function usePoll(pollId: number | null, includeAnalysis = false) {
  return useQuery({
    queryKey: ['polls', pollId, includeAnalysis],
    queryFn: async () => {
      if (!pollId) throw new Error('Poll ID required');
      return apiClient.polls.get(pollId, includeAnalysis);
    },
    enabled: !!pollId,
    staleTime: 30 * 1000,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      autoSuggestDuration = false,
    }: {
      data: PollCreateData;
      autoSuggestDuration?: boolean;
    }) => {
      return apiClient.polls.create(data, autoSuggestDuration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useUpdatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pollId,
      data,
    }: {
      pollId: number;
      data: PollUpdateData;
    }) => {
      return apiClient.polls.update(pollId, data);
    },
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: number) => {
      return apiClient.polls.delete(pollId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useVoteOnPoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pollId,
      optionId,
    }: {
      pollId: number;
      optionId: number;
    }) => {
      return apiClient.polls.vote(pollId, { option_id: optionId });
    },
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
    },
  });
}

export function useRemoveVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: number) => {
      return apiClient.polls.removeVote(pollId);
    },
    onSuccess: (_, pollId) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
    },
  });
}

export function useMyPolls(skip = 0, limit = 20) {
  return useQuery({
    queryKey: ['polls', 'my', 'created', skip, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
      return apiClient.polls.getMyPolls(params);
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useMyVotes(skip = 0, limit = 20) {
  return useQuery({
    queryKey: ['polls', 'my', 'votes', skip, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
      return apiClient.polls.getMyVotes(params);
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Hook to get user's voting stats
export function useMyVotingStats() {
  return useQuery({
    queryKey: ['polls', 'my', 'stats'],
    queryFn: () => apiClient.polls.getMyStats(),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to get poll results
export function usePollResults(pollId: number | null, detailed = false) {
  return useQuery({
    queryKey: ['polls', pollId, 'results', detailed],
    queryFn: async () => {
      if (!pollId) throw new Error('Poll ID required');
      return apiClient.polls.getResults(pollId, detailed);
    },
    enabled: !!pollId,
    staleTime: 30 * 1000,
  });
}
