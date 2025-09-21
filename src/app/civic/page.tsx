'use client';

import Link from 'next/link';
import {
  Vote,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useCivicEvents } from '@/hooks/useEvents';
import { usePolls } from '@/hooks/usePolls';
import { useMyCivicStats } from '@/hooks/useCivicStats';

export default function CivicDashboard() {
  const { isAuthenticated } = useAuthStore();

  const { data: recentEvents = [] } = useCivicEvents({
    limit: 3,
    upcoming_only: true,
    // TODO: Filter by political categories when available
  });

  const { data: activePolls = [] } = usePolls({
    active_only: true,
    limit: 3,
    poll_type: 'admin',
  });

  const { data: civicStats } = useMyCivicStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Megaphone className="h-10 w-10 text-blue-600" />
        </div>

        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Civic Engagement
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Beteilige dich aktiv an deiner Community. Organisiere politische
          Events, nimm an Abstimmungen teil und gestalte demokratische
          Entscheidungen mit.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Politische Events</h2>
                <p className="text-blue-100">
                  Organisiere und besuche politische Veranstaltungen
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 space-y-3">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_datetime).toLocaleDateString(
                          'de-DE'
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {event.participant_count}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Noch keine politischen Events geplant
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/civic/events" className="flex items-center gap-2">
                  Alle Events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {isAuthenticated && (
                <Button variant="outline" asChild>
                  <Link href="/civic/events/create">Event erstellen</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Community-Abstimmungen
                </h2>
                <p className="text-green-100">
                  Stimme ab und gestalte Entscheidungen mit
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 space-y-3">
              {activePolls.length > 0 ? (
                activePolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {poll.question.length > 50
                          ? `${poll.question.slice(0, 50)}...`
                          : poll.question}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BarChart3 className="h-4 w-4" />
                        {poll.total_votes} Stimmen
                        {poll.ends_at && (
                          <span className="text-gray-400">
                            • endet{' '}
                            {new Date(poll.ends_at).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {poll.user_vote ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Keine aktiven Abstimmungen</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/civic/polls" className="flex items-center gap-2">
                  Alle Abstimmungen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {isAuthenticated && (
                <Button variant="outline" asChild>
                  <Link href="/civic/polls/create">Abstimmung erstellen</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && civicStats && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Dein Civic Engagement
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {civicStats.events_created || 0}
              </div>
              <div className="text-sm text-gray-600">Events erstellt</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {civicStats.events_joined || 0}
              </div>
              <div className="text-sm text-gray-600">Events besucht</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {civicStats.polls_created || 0}
              </div>
              <div className="text-sm text-gray-600">Abstimmungen erstellt</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {civicStats.votes_cast || 0}
              </div>
              <div className="text-sm text-gray-600">Stimmen abgegeben</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Engagement Level:
              <span className="ml-1 font-medium capitalize text-gray-900">
                {civicStats.engagement_level || 'Neu'}
              </span>
            </span>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            Werde Teil der Community
          </h3>
          <p className="mb-4 text-blue-700">
            Registriere dich, um Events zu erstellen, an Abstimmungen
            teilzunehmen und aktiv die Zukunft deiner Community mitzugestalten.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/auth/register">Registrieren</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Anmelden</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-12 rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Was ist Civic Engagement?
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="mb-2 font-medium">Politische Events</h4>
            <p className="text-sm text-gray-600">
              Organisiere Diskussionsrunden, Demos oder
              Aufklärungsveranstaltungen
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Vote className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="mb-2 font-medium">Demokratische Abstimmungen</h4>
            <p className="text-sm text-gray-600">
              Entscheide mit über wichtige Community-Themen und lokale
              Initiativen
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="mb-2 font-medium">Transparenz</h4>
            <p className="text-sm text-gray-600">
              Alle Abstimmungen sind transparent und nachvollziehbar
              dokumentiert
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
