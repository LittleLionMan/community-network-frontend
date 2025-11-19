'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Edit3,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  HandHeart,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceDeleteButton } from '@/components/services/ServiceDeleteButton';
import { useMyServices } from '@/hooks/useServices';
import { useAuthStore } from '@/store/auth';

export default function MyServicesPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();

  const [serviceType, setServiceType] = useState<
    'all' | 'offering' | 'seeking'
  >('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/services/my');
    }
  }, [authLoading, isAuthenticated, router]);

  const isOfferingFilter =
    serviceType === 'all' ? undefined : serviceType === 'offering';

  const {
    data: services = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useMyServices({
    limit: 50,
    is_offering: isOfferingFilter,
  });

  const getServiceTypeLabel = (type: 'all' | 'offering' | 'seeking') => {
    switch (type) {
      case 'offering':
        return 'Angebote';
      case 'seeking':
        return 'Gesuche';
      default:
        return 'Alle';
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-community-600 dark:text-community-400" />
            <p className="text-gray-600 dark:text-gray-400">Wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meine Services</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-3 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
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
          <h1 className="text-3xl font-bold">Meine Services</h1>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Fehler beim Laden
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Deine Services konnten nicht geladen werden.
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
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Meine Services
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Verwalte deine angebotenen und gesuchten Services
          </p>
        </div>

        <Button
          asChild
          className="flex w-full items-center justify-center gap-2 md:w-auto md:flex-shrink-0"
        >
          <Link href="/services/create">
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Neuer Service</span>
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <HandHeart className="h-6 w-6 text-community-600 dark:text-community-400 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
                Gesamt Services
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                {services.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
                Angebote
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                {services.filter((s) => s.is_offering).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
                Gesuche
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                {services.filter((s) => !s.is_offering).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'offering', 'seeking'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setServiceType(type)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
                  serviceType === type
                    ? 'bg-community-600 text-white dark:bg-community-500'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {getServiceTypeLabel(type)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex flex-1 items-center justify-center gap-2 sm:flex-initial"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
              />
              <span className="sm:inline">Aktualisieren</span>
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
          {services.length === 1
            ? '1 Service gefunden'
            : `${services.length} Services gefunden`}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="py-12 text-center">
          <HandHeart className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Noch keine Services
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Du hast noch keine Services erstellt. Erstelle deinen ersten
            Service!
          </p>
          <Button asChild>
            <Link href="/services/create">Ersten Service erstellen</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="relative">
              <ServiceCard
                service={service}
                variant="card"
                showInterestButton={false}
                currentUserId={user?.id}
              />
              <div className="absolute right-2 top-2 z-10 hidden gap-1 sm:flex">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 w-8 bg-white bg-opacity-90 p-0 shadow-sm hover:bg-opacity-100 dark:bg-gray-800 dark:bg-opacity-90 dark:hover:bg-opacity-100"
                >
                  <Link
                    href={`/services/${service.id}`}
                    title="Service ansehen"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 w-8 bg-white bg-opacity-90 p-0 shadow-sm hover:bg-opacity-100 dark:bg-gray-800 dark:bg-opacity-90 dark:hover:bg-opacity-100"
                >
                  <Link
                    href={`/services/${service.id}/edit`}
                    title="Service bearbeiten"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="bg-white bg-opacity-90 shadow-sm dark:bg-gray-800 dark:bg-opacity-90">
                  <ServiceDeleteButton
                    service={{
                      id: service.id,
                      title: service.title,
                      user: {
                        id: service.user.id,
                      },
                      interest_count: service.interest_count,
                    }}
                    onSuccess={() => refetch()}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
