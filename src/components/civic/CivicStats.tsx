'use client';

import { TrendingUp, Vote, Calendar, Users, BarChart3 } from 'lucide-react';

interface CivicStatsProps {
  stats: {
    polls_created: number;
    votes_cast: number;
    events_created: number;
    events_joined: number;
    engagement_level: string;
  };
  className?: string;
}

export function CivicStats({ stats, className = '' }: CivicStatsProps) {
  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'low':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEngagementText = (level: string) => {
    switch (level) {
      case 'high':
        return 'Sehr aktiv';
      case 'moderate':
        return 'Aktiv';
      case 'low':
        return 'Wenig aktiv';
      default:
        return 'Neu';
    }
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Dein Civic Engagement</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center">
            <Vote className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.polls_created}
          </div>
          <div className="text-sm text-gray-600">Abstimmungen erstellt</div>
        </div>

        <div className="text-center">
          <div className="mb-1 flex items-center justify-center">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.votes_cast}
          </div>
          <div className="text-sm text-gray-600">Stimmen abgegeben</div>
        </div>

        <div className="text-center">
          <div className="mb-1 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.events_created}
          </div>
          <div className="text-sm text-gray-600">Events erstellt</div>
        </div>

        <div className="text-center">
          <div className="mb-1 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.events_joined}
          </div>
          <div className="text-sm text-gray-600">Events besucht</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 border-t pt-4">
        <TrendingUp className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">Engagement Level:</span>
        <span
          className={`text-sm font-medium ${getEngagementColor(stats.engagement_level)}`}
        >
          {getEngagementText(stats.engagement_level)}
        </span>
      </div>
    </div>
  );
}
