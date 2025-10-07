'use client';

import { useState } from 'react';
import { UserProfileModal } from './UserProfileModal';

interface ProfileAvatarProps {
  user: {
    id?: number;
    display_name: string;
    profile_image_url?: string | null;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ProfileAvatar({
  user,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl',
  };

  const getInitials = () => {
    return user.display_name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClick = () => {
    if (user.id) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden rounded-full ${user.id ? 'cursor-pointer transition-opacity hover:opacity-80' : ''} ${className}`}
      >
        {user.profile_image_url ? (
          <img
            src={user.profile_image_url}
            alt={`${user.display_name} Avatar`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600">
            <span className="font-bold text-white">{getInitials()}</span>
          </div>
        )}
      </div>

      {user.id && (
        <UserProfileModal
          userId={user.id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
