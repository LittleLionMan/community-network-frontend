'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  Users,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { VotingInterface } from '@/components/civic/VotingInterface';
import { PollResults } from '@/components/civic/PollResults';
import { PollDeleteButton } from '@/components/civic/PollDeleteButton';
import { usePoll, usePollResults } from '@/hooks/usePolls';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import { format, parseISO, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

interface PollDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const resolvedParams = use(params);
  const pollId = parseInt(resolvedParams.id);
  const router = useRouter();

  const { user, isAuthenticated } = useAuthStore();
  const { data: poll, isLoading, error, refetch } = usePoll(pollId);
  const { data: results } = usePollResults(pollId, true);

  const isActive =
    poll?.is_active &&
    (!poll?.ends_at || isAfter(parseISO(poll.ends_at), new Date()));
  const isCreator = user?.id === poll?.creator.id;
  const canEdit = isAuthenticated && (isCreator || user?.is_admin);

  const handleShare = async () => {
    if (!poll) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.question,
          text: `Abstimmung: ${poll.question}`,
          url: window.location.href,
        });
      } catch (error) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(
          'Link kopiert!',
          'Der Link zur Abstimmung wurde in die Zwischenablage kopiert.'
        );
      } catch (error) {
        toast.error('Fehler', 'Link konnte nicht kopiert werden.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/civic/polls" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Abstimmungen
            </Link>
          </Button>
        </div>

        <div className="animate-pulse space-y-6">
          <div className="h-8 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-20 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
          </div>
          <div className="h-32 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/civic/polls" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Abstimmungen
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Abstimmung nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600">
            Die Abstimmung konnte nicht geladen werden oder existiert nicht.
          </p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/civic/polls" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Abstimmungen
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>

          {canEdit && (
            <PollDeleteButton
              poll={{
                id: poll.id,
                question: poll.question,
                creator: {
                  id: poll.creator.id,
                },
                total_votes: poll.total_votes,
                poll_type: poll.poll_type,
              }}
              onSuccess={() => router.push('/civic/polls')}
              size="sm"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  poll.poll_type === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {poll.poll_type === 'admin'
                  ? '🏛️ Admin-Community-Abstimmung'
                  : '💬 Diskussions-Poll'}
              </span>

              {!isActive && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                  Beendet
                </span>
              )}

              {poll.user_vote && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Du hast abgestimmt
                </span>
              )}
            </div>

            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              {poll.question}
            </h1>

            <div className="flex items-center gap-2 text-gray-600">
              <ProfileAvatar user={poll.creator} size="sm" />
              <span>Erstellt von {poll.creator.display_name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <BarChart3 className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Beteiligung</div>
                <div className="text-sm text-gray-600">
                  {poll.total_votes}{' '}
                  {poll.total_votes === 1 ? 'Stimme' : 'Stimmen'} abgegeben
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Optionen</div>
                <div className="text-sm text-gray-600">
                  {poll.options.length} Antwortmöglichkeiten
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Erstellt</div>
                <div className="text-sm text-gray-600">
                  {format(parseISO(poll.created_at), 'dd.MM.yyyy, HH:mm', {
                    locale: de,
                  })}
                </div>
              </div>
            </div>

            {poll.ends_at && (
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {isActive ? 'Endet am' : 'Endete am'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(parseISO(poll.ends_at), 'dd.MM.yyyy, HH:mm', {
                      locale: de,
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {poll.thread && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">
                    Diese Abstimmung gehört zu einem Forum-Thread
                  </div>
                  <div className="text-sm text-blue-700">
                    {poll.thread.title}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isActive ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Deine Stimme abgeben
              </h2>

              {isAuthenticated ? (
                <VotingInterface poll={poll} variant="inline" />
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-gray-600">
                    Du musst angemeldet sein, um an dieser Abstimmung
                    teilzunehmen.
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
          ) : (
            results && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Abstimmungsergebnisse
                  </h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/civic/polls/${pollId}/results`}>
                      Detaillierte Ergebnisse
                    </Link>
                  </Button>
                </div>

                <PollResults results={results} />
              </div>
            )
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">
                Auf einen Blick
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      isActive ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {isActive ? 'Aktiv' : 'Beendet'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Typ:</span>
                  <span className="font-medium">
                    {poll.poll_type === 'admin'
                      ? 'Admin-Abstimmung'
                      : 'Diskussions-Poll'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Stimmen:</span>
                  <span className="font-medium">{poll.total_votes}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Optionen:</span>
                  <span className="font-medium">{poll.options.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Poll-ID:</span>
                  <span className="text-xs font-medium">#{poll.id}</span>
                </div>
              </div>
            </div>

            {isActive && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Aktionen</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex w-full items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Teilen
                  </Button>

                  {canEdit && (
                    <PollDeleteButton
                      poll={{
                        id: poll.id,
                        question: poll.question,
                        creator: {
                          id: poll.creator.id,
                        },
                        total_votes: poll.total_votes,
                        poll_type: poll.poll_type,
                      }}
                      onSuccess={() => router.push('/civic/polls')}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            )}

            {isActive && poll.total_votes > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Zwischenstand
                </h3>
                <div className="space-y-3">
                  {poll.options
                    .sort((a, b) => b.vote_count - a.vote_count)
                    .slice(0, 3)
                    .map((option, index) => {
                      const percentage =
                        poll.total_votes > 0
                          ? (option.vote_count / poll.total_votes) * 100
                          : 0;

                      return (
                        <div key={option.id} className="text-sm">
                          <div className="mb-1 flex justify-between">
                            <span className="truncate text-gray-700">
                              {index + 1}.{' '}
                              {option.text.length > 20
                                ? `${option.text.slice(0, 20)}...`
                                : option.text}
                            </span>
                            <span className="font-medium">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                  {poll.options.length > 3 && (
                    <p className="text-center text-xs text-gray-500">
                      ... und {poll.options.length - 3} weitere
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
