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
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Lade Rangliste...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-8 text-center text-red-600 dark:text-red-400">
        Fehler beim Laden der Rangliste
      </div>
    );
  }

  if (data.leaderboard.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        Noch keine Einträge – sei der Erste! 🚀
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.total_points_awarded}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Punkte vergeben
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-community-600 dark:text-community-400">
              {data.unique_users}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Teilnehmer
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rang
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Punkte
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {data.leaderboard.map((entry, index) => (
              <tr
                key={entry.user_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center">
                    {index === 0 && (
                      <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                    )}
                    {index === 1 && (
                      <Trophy className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                    {index === 2 && (
                      <Trophy className="mr-2 h-5 w-5 text-amber-700 dark:text-amber-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{index + 1}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar user={entry} size="sm" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {entry.display_name}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {Icon && (
                      <Icon className="h-4 w-4 text-community-600 dark:text-community-400" />
                    )}
                    {entry.total_points}
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
