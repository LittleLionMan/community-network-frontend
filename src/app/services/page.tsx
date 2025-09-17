'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  AlertCircle,
  RefreshCw,
  HandHeart,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { useServices, useServiceStats } from '@/hooks/useServices';
import { useAuthStore } from '@/store/auth';

export default function ServicesPage() {
  const { isAuthenticated, user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<
    'all' | 'offering' | 'seeking'
  >('all');
  const [excludeOwn, setExcludeOwn] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const isOfferingFilter =
    serviceType === 'all' ? undefined : serviceType === 'offering';

  const {
    data: services = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useServices({
    limit: 50,
    is_offering: isOfferingFilter,
    search: searchQuery.trim() || undefined,
    exclude_own: excludeOwn && isAuthenticated,
  });

  const { data: stats } = useServiceStats();

  const filteredServices = useMemo(() => {
    const filtered = services;

    // Additional client-side filtering can go here if needed
    // For now, most filtering is done server-side via the API

    return filtered;
  }, [services]);

  const handleInterestExpressed = (serviceId: number) => {
    console.log('Interest expressed for service:', serviceId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Service Exchange</h1>
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
          <h1 className="text-3xl font-bold">Service Exchange</h1>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fehler beim Laden der Services
          </h3>
          <p className="mb-4 text-gray-600">
            Die Services konnten nicht geladen werden. Bitte versuche es erneut.
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
          <h1 className="text-3xl font-bold text-gray-900">Service Exchange</h1>
          <p className="mt-1 text-gray-600">
            Biete und suche Services in deiner Community
          </p>
        </div>

        {isAuthenticated && (
          <Button asChild className="flex items-center gap-2">
            <Link href="/services/create">
              <Plus className="h-4 w-4" />
              Service erstellen
            </Link>
          </Button>
        )}
      </div>

      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HandHeart className="h-8 w-8 text-community-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Aktive Services
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_active_services}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Wird angeboten
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.services_offered}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Wird gesucht
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.services_requested}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <ServiceFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          serviceType={serviceType}
          onServiceTypeChange={setServiceType}
          excludeOwn={excludeOwn}
          onExcludeOwnChange={setExcludeOwn}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={filteredServices.length}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {services.length > 0 && (
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

      {filteredServices.length === 0 ? (
        <div className="py-12 text-center">
          {services.length === 0 ? (
            <>
              <HandHeart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Noch keine Services
              </h3>
              <p className="mb-4 text-gray-600">
                Es wurden noch keine Services erstellt. Sei der Erste!
              </p>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/services/create">Ersten Service erstellen</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Keine Services gefunden
              </h3>
              <p className="text-gray-600">
                Keine Services entsprechen deinen Filterkriterien.
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
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant={viewMode === 'grid' ? 'card' : 'list'}
              showInterestButton={isAuthenticated}
              currentUserId={user?.id}
              onExpressInterest={handleInterestExpressed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
