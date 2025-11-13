'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { JoinButton } from '@/components/events/JoinButton';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    start_datetime: string;
    location?: string;
    creator: {
      id: number;
      display_name: string;
      profile_image_url?: string;
    };
    category: {
      id: number;
      name: string;
    };
    participant_count: number;
    max_participants?: number;
    is_full?: boolean;
  };
  variant?: 'card' | 'list';
  showJoinButton?: boolean;
  eventType?: 'regular' | 'civic';
}

export function EventCard({
  event,
  variant = 'card',
  showJoinButton = true,
  eventType = 'regular',
}: EventCardProps) {
  const eventDate = parseISO(event.start_datetime);

  const formatEventDate = (date: Date) => {
    if (isToday(date)) {
      return `Heute, ${format(date, 'HH:mm', { locale: de })}`;
    }
    if (isTomorrow(date)) {
      return `Morgen, ${format(date, 'HH:mm', { locale: de })}`;
    }
    return format(date, 'dd.MM.yyyy, HH:mm', { locale: de });
  };

  const getParticipantText = () => {
    if (event.max_participants) {
      return `${event.participant_count}/${event.max_participants} Teilnehmer`;
    }
    return `${event.participant_count} Teilnehmer`;
  };

  const eventLink =
    eventType === 'civic' ? `/civic/events/${event.id}` : `/events/${event.id}`;

  if (variant === 'list') {
    return (
      <div className="border-b border-gray-200 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link href={eventLink} className="group block">
              <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-community-600">
                {event.title}
              </h3>
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatEventDate(eventDate)}</span>
              </div>

              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{getParticipantText()}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-community-100 px-2.5 py-0.5 text-xs font-medium text-community-800">
                {event.category.name}
              </span>

              <div className="flex items-center gap-1">
                <ProfileAvatar user={event.creator} size="sm" />
                <span className="text-xs text-gray-500">
                  von {event.creator.display_name}
                </span>
              </div>
            </div>
          </div>

          {showJoinButton && (
            <div className="flex-shrink-0">
              <JoinButton
                eventId={event.id}
                eventTitle={event.title}
                startDateTime={event.start_datetime}
                isFull={event.is_full}
                maxParticipants={event.max_participants}
                currentParticipants={event.participant_count}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <span className="inline-flex items-center rounded-full bg-community-100 px-2.5 py-0.5 text-xs font-medium text-community-800">
            {event.category.name}
          </span>

          {event.is_full && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              Ausgebucht
            </span>
          )}
        </div>

        <Link href={eventLink} className="group block">
          <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-community-600">
            {event.title}
          </h3>
        </Link>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatEventDate(eventDate)}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{getParticipantText()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ProfileAvatar user={event.creator} size="sm" />
            <span className="text-sm text-gray-600">
              von {event.creator.display_name}
            </span>
          </div>

          {showJoinButton && (
            <JoinButton
              eventId={event.id}
              eventTitle={event.title}
              startDateTime={event.start_datetime}
              isFull={event.is_full}
              maxParticipants={event.max_participants}
              currentParticipants={event.participant_count}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
