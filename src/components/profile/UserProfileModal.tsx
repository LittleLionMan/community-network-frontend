'use client';

import { X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { PublicProfileView } from './PublicProfileView';
import type { User } from '@/types';

interface UserProfileModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({
  userId,
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userData = (await apiClient.users.get(userId)) as User;
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Profil konnte nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
              {error}
            </div>
          ) : user ? (
            <PublicProfileView user={user} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
