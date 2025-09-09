import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { WebSocketAuthError } from '@/types/websocket';

export function useAuthErrorHandler() {
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(
    new Set()
  );
  const { logout } = useAuthStore();

  const handleAuthError = useCallback(
    async (error: WebSocketAuthError): Promise<boolean> => {
      console.log('🚨 Handling auth error:', error);

      switch (error.type) {
        case 'token_expired':
          try {
            const authStore = useAuthStore.getState();
            const refreshResult = await authStore.refreshToken();

            if (refreshResult.success) {
              return true;
            } else {
              logout();
              return false;
            }
          } catch (refreshError) {
            console.error('Auto-refresh failed:', refreshError);
            logout();
            return false;
          }

        case 'token_refresh_failed':
          return false;

        case 'connection_lost':
        case 'heartbeat_timeout':
          return false;

        default:
          console.warn('Unknown auth error type:', error.type);
          return false;
      }
    },
    [logout]
  );

  const dismissError = useCallback((errorId: string) => {
    setDismissedErrors((prev) => new Set([...prev, errorId]));
  }, []);

  const isErrorDismissed = useCallback(
    (errorId: string): boolean => {
      return dismissedErrors.has(errorId);
    },
    [dismissedErrors]
  );

  const clearDismissedErrors = useCallback(() => {
    setDismissedErrors(new Set());
  }, []);

  const getErrorId = useCallback((error: WebSocketAuthError): string => {
    return `${error.type}-${error.severity}`;
  }, []);

  return {
    handleAuthError,
    dismissError,
    isErrorDismissed,
    clearDismissedErrors,
    getErrorId,
  };
}
