import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { apiClient } from '@/lib/api';

interface TokenRefreshResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  error?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastValidationTime: number;
  storedRefreshToken: string | null;
  refreshInProgress: boolean;

  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  refreshToken: () => Promise<TokenRefreshResult>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastValidationTime: 0,
      storedRefreshToken: null,
      refreshInProgress: false,

      login: (user, accessToken, refreshToken) => {
        apiClient.setToken(accessToken);
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        set({
          user,
          isAuthenticated: true,
          lastValidationTime: Date.now(),
          storedRefreshToken: refreshToken,
          refreshInProgress: false,
        });
      },

      logout: () => {
        apiClient.setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastValidationTime: 0,
          storedRefreshToken: null,
          refreshInProgress: false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        apiClient.setToken(accessToken);
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        set({
          storedRefreshToken: refreshToken,
          lastValidationTime: Date.now(),
          refreshInProgress: false,
        });
      },

      validateToken: async () => {
        const state = get();
        const now = Date.now();

        if (state.isLoading || now - state.lastValidationTime < 60000) {
          return state.isAuthenticated;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
          get().logout();
          return false;
        }

        try {
          set({ isLoading: true });
          const userData = (await apiClient.auth.me()) as User;
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            lastValidationTime: now,
          });
          return true;
        } catch (error) {
          const refreshResult = await get().refreshToken();
          if (refreshResult.success) {
            try {
              const userData = (await apiClient.auth.me()) as User;
              set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                lastValidationTime: Date.now(),
              });
              return true;
            } catch (retryError) {
              console.error('❌ Validation retry failed:', retryError);
            }
          }

          get().logout();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      refreshToken: async (): Promise<TokenRefreshResult> => {
        const state = get();

        if (state.refreshInProgress) {
          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              const currentState = get();
              if (!currentState.refreshInProgress) {
                clearInterval(checkInterval);
                resolve({
                  success: currentState.isAuthenticated,
                  error: currentState.isAuthenticated
                    ? undefined
                    : 'Refresh completed but failed',
                });
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkInterval);
              resolve({
                success: false,
                error: 'Refresh timeout',
              });
            }, 10000);
          });
        }

        const refreshTokenToUse =
          state.storedRefreshToken || localStorage.getItem('refresh_token');

        if (!refreshTokenToUse) {
          return {
            success: false,
            error: 'No refresh token available',
          };
        }

        set({ refreshInProgress: true });

        try {
          const response = await apiClient.auth.refresh({
            refresh_token: refreshTokenToUse,
          });

          get().setTokens(response.access_token, response.refresh_token);

          return {
            success: true,
            token: response.access_token,
            refreshToken: response.refresh_token,
          };
        } catch (error) {
          console.error('❌ Token refresh failed:', error);

          get().logout();

          return {
            success: false,
            error:
              error instanceof Error ? error.message : 'Token refresh failed',
          };
        } finally {
          set({ refreshInProgress: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        storedRefreshToken: state.storedRefreshToken,
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const state = persistedState as Partial<AuthState>;
          return {
            ...state,
            refreshInProgress: false,
          };
        }
        return persistedState;
      },
    }
  )
);
