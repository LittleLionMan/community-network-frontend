'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, RefreshCw, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { useRegularEvents } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth';

export default function EventsPage() {
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
  } = useRegularEvents({
    limit: 50,
    category_id: selectedCategory || undefined,
    upcoming_only: false,
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

    return filtered.sort((a, b) => {
      const dateA = new Date(a.start_datetime).getTime();
      const dateB = new Date(b.start_datetime).getTime();
      return dateB - dateA;
    });
  }, [events, searchQuery, timeFilter]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Community Events</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-3 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
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
          <h1 className="text-3xl font-bold">Community Events</h1>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Fehler beim Laden der Events
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Community Events
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Entdecke Events in deiner Community
          </p>
        </div>

        {isAuthenticated && (
          <Button asChild className="w-full flex-shrink-0 sm:w-auto">
            <Link
              href="/events/create"
              className="flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="whitespace-nowrap">Event erstellen</span>
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-8">
        <EventFilters
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
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Noch keine Events
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Es wurden noch keine Events erstellt. Sei der Erste!
              </p>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/events/create">Erstes Event erstellen</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Keine Events gefunden
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
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
              eventType="regular"
            />
          ))}
        </div>
      )}
    </div>
  );
}
