'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Edit,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { JoinButton } from '@/components/events/JoinButton';
import { EventDeleteButton } from '@/components/events/EventDeleteButton';
import { useEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import {
  getRegistrationDeadlineText,
  isRegistrationDeadlinePassed,
} from '@/lib/utils';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = use(params);
  const eventId = parseInt(resolvedParams.id);
  const router = useRouter();

  const { user, isAuthenticated } = useAuthStore();
  const { data: event, isLoading, error, refetch } = useEvent(eventId);

  const formatEventDateTime = (startDateTime: string, endDateTime?: string) => {
    const startDate = parseISO(startDateTime);
    const endDate = endDateTime ? parseISO(endDateTime) : null;

    let dateText = '';
    if (isToday(startDate)) {
      dateText = 'Heute';
    } else if (isTomorrow(startDate)) {
      dateText = 'Morgen';
    } else {
      dateText = format(startDate, 'EEEE, dd.MM.yyyy', { locale: de });
    }

    const startTime = format(startDate, 'HH:mm', { locale: de });
    const endTime = endDate ? format(endDate, 'HH:mm', { locale: de }) : null;

    return {
      dateText,
      timeText: endTime ? `${startTime} - ${endTime}` : startTime,
      isPastEvent: isPast(startDate),
    };
  };

  const handleShare = async () => {
    if (!event) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Event: ${event.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(
          'Link kopiert!',
          'Event-Link wurde in die Zwischenablage kopiert.'
        );
      } catch (error) {
        toast.error('Fehler', 'Link konnte nicht kopiert werden.');
        console.log(error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/events" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Events
            </Link>
          </Button>
        </div>

        <div className="animate-pulse space-y-6">
          <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-20 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-20 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/events" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Events
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Event nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Das Event konnte nicht geladen werden oder existiert nicht.
          </p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  const { dateText, timeText, isPastEvent } = formatEventDateTime(
    event.start_datetime,
    event.end_datetime
  );
  const isDeadlinePassed = isRegistrationDeadlinePassed(event.start_datetime);
  const deadlineText = getRegistrationDeadlineText(event.start_datetime);

  const isCreator = user?.id === event.creator.id;
  const canEdit =
    isAuthenticated && (isCreator || user?.is_admin) && !isPastEvent;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/events" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Zurück zu Events</span>
              <span className="sm:hidden">Zurück</span>
            </Link>
          </Button>

          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Teilen</span>
          </Button>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 sm:flex-none"
            >
              <Link
                href={`/events/${eventId}/edit`}
                className="flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span>Bearbeiten</span>
              </Link>
            </Button>

            <div className="flex-1 sm:flex-none">
              <EventDeleteButton
                event={{
                  id: event.id,
                  title: event.title,
                  creator: {
                    id: event.creator.id,
                  },
                  participant_count: event.participant_count,
                }}
                onSuccess={() => router.push('/events')}
                variant="button"
                size="sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-community-100 px-3 py-1 text-sm font-medium text-community-800 dark:bg-community-900 dark:text-community-200">
                {event.category?.name || 'Keine Kategorie'}
              </span>

              {isPastEvent && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Vergangen
                </span>
              )}

              {event.is_full && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  Ausgebucht
                </span>
              )}
            </div>

            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {event.title}
            </h1>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <ProfileAvatar user={event.creator} size="sm" />
              <span>Organisiert von {event.creator.display_name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-800 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {dateText}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {timeText} Uhr
                </div>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Ort
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {event.location}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Anmeldung
                </div>
                <div
                  className={`text-sm ${isDeadlinePassed ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  {deadlineText}
                  {isDeadlinePassed && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                      Abgelaufen
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Teilnehmer
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {event.max_participants
                    ? `${event.participant_count}/${event.max_participants} Personen`
                    : `${event.participant_count} Personen`}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Erstellt
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {format(parseISO(event.created_at), 'dd.MM.yyyy', {
                    locale: de,
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Beschreibung
            </h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {!isPastEvent && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                {isAuthenticated ? (
                  <JoinButton
                    eventId={eventId}
                    eventTitle={event.title}
                    startDateTime={event.start_datetime}
                    isFull={event.is_full}
                    isCreator={isCreator}
                    maxParticipants={event.max_participants}
                    currentParticipants={event.participant_count}
                    className="w-full"
                  />
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                      Du musst angemeldet sein, um an Events teilzunehmen.
                    </p>
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <Link href="/auth/login">Anmelden</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/register">Registrieren</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
                Event Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`font-medium ${
                      isPastEvent
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {isPastEvent ? 'Beendet' : 'Aktiv'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Kategorie:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {event.category?.name || 'Keine'}
                  </span>
                </div>

                {event.max_participants && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Freie Plätze:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.max(
                        0,
                        event.max_participants - event.participant_count
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Event-ID:
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    #{event.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
