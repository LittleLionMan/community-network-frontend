import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { UserSummary } from '@/types/forum';

export function useUserSearch(query: string, enabled: boolean = true) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || query.length < 2) {
      setUsers([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: '10',
        });

        const response = await apiClient.users.list(params);
        setUsers(response as UserSummary[]);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('User search error:', error);
        }
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, enabled]);

  return { users, isLoading };
}
