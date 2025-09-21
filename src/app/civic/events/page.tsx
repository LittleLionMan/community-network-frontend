'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  AlertCircle,
  RefreshCw,
  Calendar,
  Search,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/EventCard';
import { CivicEventFilters } from '@/components/civic/CivicEventFilters';
import { useCivicEvents } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth';

export default function CivicEventsPage() {
  const { isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<
    'all' | 'today' | 'week' | 'month'
  >('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCivicEvents({
    limit: 50,
    category_id: selectedCategory || undefined,
    upcoming_only: true,
  });

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.creator.display_name.toLowerCase().includes(query)
      );
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start_datetime);

        switch (timeFilter) {
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventDate >= today && eventDate < tomorrow;

          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return eventDate >= today && eventDate < weekEnd;

          case 'month':
            const monthEnd = new Date(today);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            return eventDate >= today && eventDate < monthEnd;

          default:
            return true;
        }
      });
    }

    return filtered;
  }, [events, searchQuery, timeFilter]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Politische Events</h1>
            <p className="mt-1 text-gray-600">
              Organisiere und besuche politische Veranstaltungen
            </p>
          </div>
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
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Politische Events</h1>
            <p className="mt-1 text-gray-600">
              Organisiere und besuche politische Veranstaltungen
            </p>
          </div>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fehler beim Laden der Events
          </h3>
          <p className="mb-4 text-gray-600">
            Die Events konnten nicht geladen werden. Bitte versuche es erneut.
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
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Megaphone className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Politische Events
            </h1>
          </div>
          <p className="text-gray-600">
            Organisiere und besuche politische Veranstaltungen in deiner
            Community
          </p>
        </div>

        {isAuthenticated && (
          <Button asChild className="flex items-center gap-2">
            <Link href="/civic/events/create">
              <Plus className="h-4 w-4" />
              Politisches Event erstellen
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">
              Willkommen im Civic Event-Bereich
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              Hier findest du Events mit politischem oder gesellschaftlichem
              Fokus: Diskussionsrunden, Aufklärungsveranstaltungen, Demos und
              Community-Initiativen.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <CivicEventFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={filteredEvents.length}
        />
      </div>

      {events.length > 0 && (
        <div className="mb-4 flex justify-end">
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
            Aktualisieren
          </Button>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="py-12 text-center">
          {events.length === 0 ? (
            <>
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Noch keine politischen Events
              </h3>
              <p className="mb-4 text-gray-600">
                Es wurden noch keine politischen Events erstellt. Sei der Erste
                und organisiere ein Event für deine Community!
              </p>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/civic/events/create">
                    Erstes politisches Event erstellen
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Keine Events gefunden
              </h3>
              <p className="text-gray-600">
                Keine Events entsprechen deinen Filterkriterien.
              </p>
            </>
          )}
        </div>
      ) : (
        <div
          className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }`}
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              variant={viewMode === 'grid' ? 'card' : 'list'}
              showJoinButton={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
