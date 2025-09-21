'use client';

import { Award, Star, TrendingUp } from 'lucide-react';

interface ParticipationBadgeProps {
  level: 'bronze' | 'silver' | 'gold' | 'inactive';
  votesCount: number;
  eventsCount: number;
  className?: string;
}

export function ParticipationBadge({
  level,
  votesCount,
  eventsCount,
  className = '',
}: ParticipationBadgeProps) {
  const getBadgeConfig = (level: string) => {
    switch (level) {
      case 'gold':
        return {
          icon: <Award className="h-4 w-4" />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
          title: 'Gold Engagement',
          description: 'Sehr aktives Community-Mitglied',
        };
      case 'silver':
        return {
          icon: <Star className="h-4 w-4" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
          title: 'Silber Engagement',
          description: 'Aktives Community-Mitglied',
        };
      case 'bronze':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-300',
          title: 'Bronze Engagement',
          description: 'Engagiertes Community-Mitglied',
        };
      default:
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          title: 'Neues Mitglied',
          description: 'Beginne dein Civic Engagement',
        };
    }
  };

  const config = getBadgeConfig(level);

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3 ${className}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className={config.textColor}>{config.icon}</div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.title}
        </span>
      </div>

      <p className={`text-xs ${config.textColor} mb-2 opacity-80`}>
        {config.description}
      </p>

      <div className={`text-xs ${config.textColor} space-y-1`}>
        <div>🗳️ {votesCount} Stimmen abgegeben</div>
        <div>📅 {eventsCount} Events besucht</div>
      </div>
    </div>
  );
}
