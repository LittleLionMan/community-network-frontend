import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastValidationTime: number;
  login: (user: User) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastValidationTime: 0,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          lastValidationTime: Date.now(),
        });
      },

      logout: () => {
        apiClient.setToken(null);
        localStorage.removeItem('auth_token');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastValidationTime: 0,
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
          get().logout();
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
