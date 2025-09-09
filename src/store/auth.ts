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

      login: (user, accessToken, refreshToken) => {
        apiClient.setToken(accessToken);
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        set({
          user,
          isAuthenticated: true,
          lastValidationTime: Date.now(),
          storedRefreshToken: refreshToken,
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
        });
      },

      setTokens: (accessToken, refreshToken) => {
        apiClient.setToken(accessToken);
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        set({
          storedRefreshToken: refreshToken,
          lastValidationTime: Date.now(),
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
          console.log('Token validation failed:', error);

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
              console.error('Validation retry failed:', retryError);
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
        const refreshTokenToUse =
          state.storedRefreshToken || localStorage.getItem('refresh_token'); // UMBENANNT

        if (!refreshTokenToUse) {
          return {
            success: false,
            error: 'No refresh token available',
          };
        }

        try {
          console.log('🔄 Refreshing authentication token...');

          const response = await apiClient.auth.refresh({
            refresh_token: refreshTokenToUse,
          });

          get().setTokens(response.access_token, response.refresh_token);

          console.log('✅ Token refreshed successfully');

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
    }
  )
);
