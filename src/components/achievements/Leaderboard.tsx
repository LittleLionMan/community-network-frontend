'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { apiClient } from '@/lib/api';
import { ComponentType } from 'react';

interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  profile_image_url: string | null;
  total_points: number;
  achievement_count: number;
}

interface LeaderboardData {
  achievement_type: string;
  total_points_awarded: number;
  total_achievements: number;
  unique_users: number;
  leaderboard: LeaderboardEntry[];
}

interface AchievementLeaderboardProps {
  achievementType: string;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  limit?: number;
  showStats?: boolean;
}

export function AchievementLeaderboard({
  achievementType,
  title,
  icon: Icon,
  limit = 50,
  showStats = true,
}: AchievementLeaderboardProps) {
  const { data, isLoading, error } = useQuery<LeaderboardData>({
    queryKey: ['achievement-leaderboard', achievementType],
    queryFn: () =>
      apiClient.request(
        `/api/achievements/leaderboard?achievement_type=${achievementType}&limit=${limit}`
      ),
  });

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-community-200 border-t-community-600"></div>
        <p className="mt-2 text-sm text-gray-600">Lade Rangliste...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-8 text-center text-red-600">
        Fehler beim Laden der Rangliste
      </div>
    );
  }

  if (data.leaderboard.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Noch keine Einträge – sei der Erste! 🚀
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {data.total_points_awarded}
            </div>
            <div className="text-sm text-gray-600">Punkte vergeben</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.total_achievements}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-community-600">
              {data.unique_users}
            </div>
            <div className="text-sm text-gray-600">Teilnehmer</div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rang
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Punkte
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Anzahl
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.leaderboard.map((entry, index) => (
              <tr key={entry.user_id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center">
                    {index === 0 && (
                      <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                    )}
                    {index === 1 && (
                      <Trophy className="mr-2 h-5 w-5 text-gray-400" />
                    )}
                    {index === 2 && (
                      <Trophy className="mr-2 h-5 w-5 text-amber-700" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar user={entry} size="sm" />
                    <span className="text-sm font-medium text-gray-900">
                      {entry.display_name}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                    {Icon && <Icon className="h-4 w-4 text-community-600" />}
                    {entry.total_points}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <span className="text-sm text-gray-600">
                    {entry.achievement_count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
