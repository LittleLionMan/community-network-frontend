'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  HandHeart,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceDeleteButton } from '@/components/services/ServiceDeleteButton';
import { useMyServices, useServiceMutations } from '@/hooks/useServices';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';

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

  const { deleteService, isDeleting } = useServiceMutations();

  const handleDelete = async (serviceId: number, title: string) => {
    if (!window.confirm(`Service "${title}" wirklich löschen?`)) {
      return;
    }

    try {
      await deleteService(serviceId);
      toast.success(
        'Service gelöscht',
        'Der Service wurde erfolgreich gelöscht.'
      );
      refetch();
    } catch (error) {
      toast.error(
        'Fehler beim Löschen',
        'Der Service konnte nicht gelöscht werden.'
      );
    }
  };

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
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-community-600" />
            <p className="text-gray-600">Wird geladen...</p>
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meine Services</h1>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fehler beim Laden
          </h3>
          <p className="mb-4 text-gray-600">
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meine Services</h1>
          <p className="mt-1 text-gray-600">
            Verwalte deine angebotenen und gesuchten Services
          </p>
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link href="/services/create">
            <Plus className="h-4 w-4" />
            Neuer Service
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HandHeart className="h-8 w-8 text-community-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Gesamt Services
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {services.length}
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
              <p className="text-sm font-medium text-gray-600">Angebote</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter((s) => s.is_offering).length}
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
              <p className="text-sm font-medium text-gray-600">Gesuche</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter((s) => !s.is_offering).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-md border border-gray-300">
            {(['all', 'offering', 'seeking'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setServiceType(type)}
                className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                  serviceType === type
                    ? 'bg-community-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-r border-gray-300 last:border-r-0`}
              >
                {getServiceTypeLabel(type)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
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
        </div>

        <div className="text-sm text-gray-600">
          {services.length === 1
            ? '1 Service gefunden'
            : `${services.length} Services gefunden`}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="py-12 text-center">
          <HandHeart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Noch keine Services
          </h3>
          <p className="mb-4 text-gray-600">
            Du hast noch keine Services erstellt. Erstelle deinen ersten
            Service!
          </p>
          <Button asChild>
            <Link href="/services/create">Ersten Service erstellen</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="relative">
              <ServiceCard
                service={service}
                variant="card"
                showInterestButton={false}
                currentUserId={user?.id}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 w-8 bg-white bg-opacity-90 p-0 hover:bg-opacity-100"
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
                  className="h-8 w-8 bg-white bg-opacity-90 p-0 hover:bg-opacity-100"
                >
                  <Link
                    href={`/services/${service.id}/edit`}
                    title="Service bearbeiten"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                </Button>

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
          ))}
        </div>
      )}
    </div>
  );
}
