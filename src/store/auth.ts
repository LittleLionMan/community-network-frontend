import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: User) => void;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          await apiClient.auth.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      validateToken: async () => {
        try {
          set({ isLoading: true });
          const userData = await apiClient.auth.me();
          set({
            user: userData as User,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          console.log(error);
          const refreshed = await get().refreshToken();
          if (refreshed) {
            try {
              const userData = await apiClient.auth.me();
              set({
                user: userData as User,
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            } catch {
              await get().logout();
              return false;
            }
          }

          await get().logout();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      refreshToken: async (): Promise<boolean> => {
        try {
          await apiClient.auth.refresh();
          const userData = await apiClient.auth.me();
          set({
            user: userData as User,
            isAuthenticated: true,
          });
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          await get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
