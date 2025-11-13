'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  AlertCircle,
  RefreshCw,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CivicEventEditForm } from '@/components/civic/CivicEventEditForm';
import { useEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

interface CivicEventEditPageProps {
  params: Promise<{ id: string }>;
}

export default function CivicEventEditPage({
  params,
}: CivicEventEditPageProps) {
  const resolvedParams = use(params);
  const eventId = parseInt(resolvedParams.id);
  const router = useRouter();

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: event, isLoading, error, refetch } = useEvent(eventId);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/civic/events/${eventId}/edit`);
    }
  }, [isAuthenticated, authLoading, router, eventId]);

  const handleSuccess = () => {
    router.push(`/civic/events/${eventId}`);
  };

  const handleCancel = () => {
    router.push(`/civic/events/${eventId}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              href={`/civic/events/${eventId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum politischen Event
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
              href={`/civic/events/${eventId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum politischen Event
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Politisches Event nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600">
            Das politische Event konnte nicht geladen werden oder existiert
            nicht.
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
              href={`/civic/events/${eventId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum politischen Event
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Keine Berechtigung
          </h3>
          <p className="mb-4 text-gray-600">
            Du bist nicht berechtigt, dieses politische Event zu bearbeiten.
          </p>
          <Button asChild>
            <Link href={`/civic/events/${eventId}`}>Zurück zum Event</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link
            href={`/civic/events/${eventId}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum politischen Event
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Politisches Event bearbeiten
            </h1>
            <p className="mt-2 text-gray-600">
              Bearbeite die Details für das politische Event {event.title}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">
              Politisches Event bearbeiten
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              Du bearbeitest ein Event mit politischem oder gesellschaftlichem
              Fokus. Bitte achte weiterhin auf eine sachliche, respektvolle
              Beschreibung und demokratische Werte.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <CivicEventEditForm
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
                  <span className="text-gray-600">Typ:</span>
                  <span className="font-medium text-blue-600">
                    Politisches Event
                  </span>
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

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 className="mb-2 font-medium text-orange-900">
                Wichtige Hinweise
              </h4>
              <ul className="space-y-1 text-sm text-orange-800">
                <li>• Änderungen sind sofort für alle Teilnehmer sichtbar</li>
                <li>
                  • Bei Datum/Zeit-Änderungen werden Teilnehmer benachrichtigt
                </li>
                <li>• Achte auf demokratische und respektvolle Inhalte</li>
                <li>
                  • Bei größeren Änderungen informiere die Teilnehmer vorab
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
