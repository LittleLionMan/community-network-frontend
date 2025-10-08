'use client';

import { useState } from 'react';
import { Bug, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';

interface AwardBugBountyButtonProps {
  postId: number;
  authorId: number;
  isConfirmed: boolean;
}

export function AwardBugBountyButton({
  postId,
  authorId,
  isConfirmed,
}: AwardBugBountyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAward = async () => {
    try {
      setIsLoading(true);

      await apiClient.request('/api/achievements', {
        method: 'POST',
        body: JSON.stringify({
          user_id: authorId,
          achievement_type: 'bug_bounty',
          points: 1,
          reference_type: 'forum_post',
          reference_id: postId,
        }),
      });

      toast.success('Bug bestätigt', 'Achievement wurde vergeben');

      queryClient.invalidateQueries({ queryKey: ['thread-posts'] });
      queryClient.invalidateQueries({
        queryKey: ['achievement-leaderboard', 'bug_bounty'],
      });
    } catch (error) {
      console.error('Failed to award bug bounty:', error);
      toast.error(
        'Fehler',
        error instanceof Error
          ? error.message
          : 'Achievement konnte nicht vergeben werden'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirmed) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="border-green-600 text-green-600"
        title="Bug bereits bestätigt"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAward}
      disabled={isLoading}
      title="Als Bug bestätigen"
      className="text-green-600 hover:bg-green-50 hover:text-green-700"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Bug className="h-4 w-4" />
      )}
    </Button>
  );
}
