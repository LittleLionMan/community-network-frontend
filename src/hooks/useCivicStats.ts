import { useQuery } from '@tanstack/react-query';
import { useMyVotingStats } from './usePolls';
// TODO: Import event stats when available
// import { useMyEventStats } from './useEvents';

export interface CivicStats {
  polls_created: number;
  votes_cast: number;
  events_created: number;
  events_joined: number;
  engagement_level: 'inactive' | 'low' | 'moderate' | 'high';
}

export function useMyCivicStats() {
  const { data: votingStats } = useMyVotingStats();
  // TODO: Add event stats when political event categories are available
  // const { data: eventStats } = useMyEventStats();

  return useQuery({
    queryKey: ['civic-stats', 'combined', votingStats?.user_id],
    queryFn: async (): Promise<CivicStats> => {
      // For now, we only have voting stats
      // TODO: Fetch and combine event stats when available

      return {
        polls_created: votingStats?.polls_created || 0,
        votes_cast: votingStats?.votes_cast || 0,
        events_created: 0, // TODO: Implement when political event categories exist
        events_joined: 0, // TODO: Implement when political event categories exist
        engagement_level: votingStats?.engagement_level || 'inactive',
      };
    },
    enabled: !!votingStats,
    staleTime: 5 * 60 * 1000,
  });
}
