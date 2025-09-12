'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventEditForm } from '@/components/events/EventEditForm';
import { useEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

interface EventEditPageProps {
  params: Promise<{ id: string }>;
}

export default function EventEditPage({ params }: EventEditPageProps) {
  const resolvedParams = use(params);
  const eventId = parseInt(resolvedParams.id);
  const router = useRouter();

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: event, isLoading, error, refetch } = useEvent(eventId);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/events/${eventId}/edit`);
    }
  }, [isAuthenticated, authLoading, router, eventId]);

  const handleSuccess = () => {
    router.push(`/events/${eventId}`);
  };

  const handleCancel = () => {
    router.push(`/events/${eventId}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              href={`/events/${eventId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Event
            </Link>
          </Button>
        </div>

        <div className="animate-pulse space-y-6">
          <div className="h-8 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-4">
            <div className="h-10 rounded bg-gray-200"></div>
            <div className="h-10 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              href={`/events/${eventId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Event
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Event nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600">
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

  const isCreator = user?.id === event.creator.id;
  const canEdit = isCreator || user?.is_admin;

  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              href={`/events/${eventId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Event
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Keine Berechtigung
          </h3>
          <p className="mb-4 text-gray-600">
            Du bist nicht berechtigt, dieses Event zu bearbeiten.
          </p>
          <Button asChild>
            <Link href={`/events/${eventId}`}>Zurück zum Event</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/events/${eventId}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Event
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-community-100">
              <Edit className="h-6 w-6 text-community-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Event bearbeiten
            </h1>
            <p className="mt-2 text-gray-600">
              Bearbeite die Details für {event.title}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <EventEditForm
              event={event}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">
                Event Informationen
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event ID:</span>
                  <span className="text-xs font-medium">#{event.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teilnehmer:</span>
                  <span className="font-medium">{event.participant_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">
                    {event.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Hinweis:</strong> Änderungen werden sofort gespeichert
                und sind für alle Teilnehmer sichtbar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
