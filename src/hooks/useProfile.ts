'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import type { User } from '@/types';

interface ProfileUpdateData {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
}

interface PrivacyUpdateData {
  email_private?: boolean;
  first_name_private?: boolean;
  last_name_private?: boolean;
  bio_private?: boolean;
  exact_address_private?: boolean;
  created_at_private?: boolean;
}

export function useProfile() {
  const { user: authUser, login, logout } = useAuthStore();
  const [user, setUser] = useState<User | null>(authUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = (error: unknown) => {
    if (error instanceof Error && error.message.includes('401')) {
      console.warn('⚠️ Auth error detected, logging out');
      logout();
      window.location.href = '/auth/login';
    }
  };

  const refreshUser = async () => {
    if (!authUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const userData = (await apiClient.auth.me()) as User;
      setUser(userData);
      login(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user) throw new Error('No user logged in');

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = (await apiClient.users.updateMe(data)) as User;
      setUser(updatedUser);
      login(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      handleAuthError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrivacy = async (data: PrivacyUpdateData) => {
    if (!user) throw new Error('No user logged in');

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = (await apiClient.users.updateMe(data)) as User;
      setUser(updatedUser);
      login(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update privacy settings'
      );
      handleAuthError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileImage = (imageUrl: string | null) => {
    if (user) {
      const updatedUser = { ...user, profile_image_url: imageUrl };
      setUser(updatedUser);
      login(updatedUser);
    }
  };

  useEffect(() => {
    if (authUser && !user) {
      refreshUser();
    } else if (!authUser) {
      setUser(null);
    }
  }, [authUser]);

  return {
    user,
    isLoading,
    error,
    refreshUser,
    updateProfile,
    updatePrivacy,
    updateProfileImage,
  };
}
