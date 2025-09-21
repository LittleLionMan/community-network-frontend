'use client';

import Link from 'next/link';
import {
  Vote,
  Users,
  Clock,
  CheckCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { VotingInterface } from './VotingInterface';
import { format, parseISO, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Poll } from '@/lib/api';

interface PollCardProps {
  poll: Poll;
  variant?: 'card' | 'list';
  showVoting?: boolean;
  className?: string;
}

export function PollCard({
  poll,
  variant = 'card',
  showVoting = true,
  className = '',
}: PollCardProps) {
  const isActive =
    poll.is_active &&
    (!poll.ends_at || isAfter(parseISO(poll.ends_at), new Date()));
  const hasVoted = !!poll.user_vote;

  const formatEndDate = (endDate: string) => {
    const date = parseISO(endDate);
    return format(date, 'dd.MM.yyyy, HH:mm', { locale: de });
  };

  if (variant === 'list') {
    return (
      <div className={`border-b border-gray-200 py-4 ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link href={`/civic/polls/${poll.id}`} className="group block">
              <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                {poll.question}
              </h3>
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>{poll.total_votes} Stimmen</span>
              </div>

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{poll.options.length} Optionen</span>
              </div>

              {poll.ends_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>bis {formatEndDate(poll.ends_at)}</span>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  poll.poll_type === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {poll.poll_type === 'admin'
                  ? 'Community-Abstimmung'
                  : 'Thread-Poll'}
              </span>

              {hasVoted && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Abgestimmt
                </span>
              )}

              {!isActive && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  Beendet
                </span>
              )}

              <div className="flex items-center gap-1">
                <ProfileAvatar user={poll.creator} size="sm" />
                <span className="text-xs text-gray-500">
                  von {poll.creator.display_name}
                </span>
              </div>
            </div>
          </div>

          {showVoting && isActive && (
            <div className="flex-shrink-0">
              <VotingInterface poll={poll} size="sm" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md ${className}`}
    >
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              poll.poll_type === 'admin'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {poll.poll_type === 'admin'
              ? '🏛️ Admin-Abstimmung'
              : '💬 Diskussions-Poll'}
          </span>

          {hasVoted && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Abgestimmt
            </span>
          )}

          {!isActive && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              Beendet
            </span>
          )}
        </div>

        <Link href={`/civic/polls/${poll.id}`} className="group block">
          <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {poll.question}
          </h3>
        </Link>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span>{poll.total_votes} Stimmen abgegeben</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Vote className="h-4 w-4 flex-shrink-0" />
            <span>{poll.options.length} Antwortmöglichkeiten</span>
          </div>

          {poll.ends_at && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {isActive ? 'Endet am' : 'Endete am'}{' '}
                {formatEndDate(poll.ends_at)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              Erstellt am{' '}
              {format(parseISO(poll.created_at), 'dd.MM.yyyy', { locale: de })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ProfileAvatar user={poll.creator} size="sm" />
            <span className="text-sm text-gray-600">
              von {poll.creator.display_name}
            </span>
          </div>

          {showVoting && isActive && <VotingInterface poll={poll} size="sm" />}
        </div>

        {!isActive && poll.total_votes > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/civic/polls/${poll.id}/results`}>
                Ergebnisse ansehen
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
