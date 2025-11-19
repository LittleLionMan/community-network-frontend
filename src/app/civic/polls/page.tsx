'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  AlertCircle,
  RefreshCw,
  Vote,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PollCard } from '@/components/civic/PollCard';
import { usePolls } from '@/hooks/usePolls';
import { useAuthStore } from '@/store/auth';

export default function PollsPage() {
  const { isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [pollTypeFilter, setPollTypeFilter] = useState<
    'all' | 'admin' | 'thread'
  >('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>(
    'active'
  );

  const {
    data: polls = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = usePolls({
    limit: 50,
    poll_type: pollTypeFilter !== 'all' ? pollTypeFilter : undefined,
    active_only: statusFilter === 'active',
  });

  const filteredPolls = useMemo(() => {
    let filtered = polls;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (poll) =>
          poll.question.toLowerCase().includes(query) ||
          poll.creator.display_name.toLowerCase().includes(query)
      );
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(
        (poll) =>
          poll.is_active &&
          (!poll.ends_at || new Date(poll.ends_at) > new Date())
      );
    } else if (statusFilter === 'ended') {
      filtered = filtered.filter(
        (poll) =>
          !poll.is_active ||
          (poll.ends_at && new Date(poll.ends_at) < new Date())
      );
    }

    return filtered;
  }, [polls, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Community-Abstimmungen</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-3 h-4 w-1/3 rounded bg-gray-200"></div>
              <div className="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Community-Abstimmungen</h1>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fehler beim Laden der Abstimmungen
          </h3>
          <p className="mb-4 text-gray-600">
            Die Abstimmungen konnten nicht geladen werden. Bitte versuche es
            erneut.
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Community-Abstimmungen
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Nimm an Abstimmungen teil und gestalte deine Community mit
          </p>
        </div>

        {isAuthenticated && (
          <Button asChild className="w-full flex-shrink-0 sm:w-auto">
            <Link
              href="/civic/polls/create"
              className="flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="whitespace-nowrap">Abstimmung erstellen</span>
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Abstimmungen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="hidden text-sm text-gray-600 sm:inline">
              Filter:
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'ended'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="text-xs"
            >
              {status === 'all' && 'Alle'}
              {status === 'active' && 'Aktiv'}
              {status === 'ended' && 'Beendet'}
            </Button>
          ))}

          {(['all', 'admin', 'thread'] as const).map((type) => (
            <Button
              key={type}
              variant={pollTypeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPollTypeFilter(type)}
              className="text-xs"
            >
              {type === 'all' && 'Alle Typen'}
              {type === 'admin' && 'Admin-Abstimmungen'}
              {type === 'thread' && 'Diskussions-Polls'}
            </Button>
          ))}
        </div>
      </div>

      {polls.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredPolls.length === 1
              ? '1 Abstimmung gefunden'
              : `${filteredPolls.length} Abstimmungen gefunden`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Aktualisieren</span>
          </Button>
        </div>
      )}

      {filteredPolls.length === 0 ? (
        <div className="py-12 text-center">
          {polls.length === 0 ? (
            <>
              <Vote className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Noch keine Abstimmungen
              </h3>
              <p className="mb-4 text-gray-600">
                Es wurden noch keine Abstimmungen erstellt. Sei der Erste!
              </p>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/civic/polls/create">
                    Erste Abstimmung erstellen
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Keine Abstimmungen gefunden
              </h3>
              <p className="text-gray-600">
                Keine Abstimmungen entsprechen deinen Filterkriterien.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              variant="card"
              showVoting={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
