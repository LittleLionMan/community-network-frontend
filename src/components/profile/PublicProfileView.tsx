'use client';

import { User, MapPin, Calendar, Check } from 'lucide-react';
import type { User as UserType } from '@/types';

interface PublicProfileViewProps {
  user: Partial<UserType>;
  stats?: {
    events_attended: number;
    services_offered: number;
  };
  isPreview?: boolean;
}

export function PublicProfileView({
  user,
  stats,
  isPreview = false,
}: PublicProfileViewProps) {
  return (
    <div className={`bg-white ${!isPreview ? 'border' : ''} rounded-lg p-6`}>
      <div className="mb-6 flex items-start space-x-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600">
          <User className="h-8 w-8 text-white" />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.display_name}
          </h1>

          {(user.first_name || user.last_name) && (
            <p className="text-gray-600">
              {user.first_name} {user.last_name}
            </p>
          )}

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            {user.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {user.location}
              </div>
            )}

            {user.created_at && (
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Dabei seit{' '}
                {new Date(user.created_at).toLocaleDateString('de-DE')}
              </div>
            )}
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="mb-6">
          <h3 className="mb-2 font-medium text-gray-900">Über mich</h3>
          <p className="text-gray-700">{user.bio}</p>
        </div>
      )}

      <div className="mb-6 flex items-center space-x-4 text-sm">
        <div className="flex items-center text-green-600">
          <Check className="mr-1 h-4 w-4" />
          Email bestätigt
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.events_attended}
            </div>
            <div className="text-sm text-gray-600">Events besucht</div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.services_offered}
            </div>
            <div className="text-sm text-gray-600">Services angeboten</div>
          </div>
        </div>
      )}

      {user.email && (
        <div className="mt-6 border-t pt-6">
          <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700">
            Nachricht senden
          </button>
        </div>
      )}
    </div>
  );
}
