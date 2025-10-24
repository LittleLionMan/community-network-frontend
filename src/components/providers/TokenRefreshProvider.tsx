'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export function TokenRefreshProvider() {
  useEffect(() => {
    const auth = useAuthStore.getState();

    if (!auth.isAuthenticated) return;
    const interval = setInterval(
      async () => {
        const refreshed = await useAuthStore.getState().refreshToken();
        if (!refreshed) {
          console.warn(
            '🔒 Auto token refresh failed – user may need to log in again'
          );
        }
      },
      25 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  return null;
}
