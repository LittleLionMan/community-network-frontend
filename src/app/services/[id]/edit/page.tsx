'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceEditForm } from '@/components/services/ServiceEditForm';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import type { Service } from '@/types/service';

interface ServiceEditPageProps {
  params: Promise<{ id: string }>;
}

export default function ServiceEditPage({ params }: ServiceEditPageProps) {
  const resolvedParams = use(params);
  const serviceId = parseInt(resolvedParams.id);
  const router = useRouter();

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/services/${serviceId}/edit`);
    }
  }, [isAuthenticated, authLoading, router, serviceId]);

  useEffect(() => {
    const fetchService = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.services.get(serviceId);
        setService(response as Service);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Service nicht gefunden';
        setError(errorMessage);
        console.error('Failed to fetch service:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [serviceId, isAuthenticated]);

  const handleSuccess = () => {
    router.push(`/services/${serviceId}`);
  };

  const handleCancel = () => {
    router.push(`/services/${serviceId}`);
  };

  const refetch = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.services.get(serviceId);
      setService(response as Service);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Service nicht gefunden';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              href={`/services/${serviceId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Service
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

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              href={`/services/${serviceId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Service
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Service nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600">
            Der Service konnte nicht geladen werden oder existiert nicht.
          </p>
          <Button onClick={refetch} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === service.user.id;
  const canEdit = isCreator || user?.is_admin;

  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              href={`/services/${serviceId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Service
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Keine Berechtigung
          </h3>
          <p className="mb-4 text-gray-600">
            Du bist nicht berechtigt, diesen Service zu bearbeiten.
          </p>
          <Button asChild>
            <Link href={`/services/${serviceId}`}>Zurück zum Service</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriceDisplay = () => {
    if (!service.price_type || service.price_type === 'free') {
      return 'Kostenlos';
    }
    if (service.price_type === 'exchange') {
      return 'Tausch';
    }
    if (service.price_type === 'negotiable') {
      return 'Verhandelbar';
    }
    if (service.price_type === 'paid' && service.price_amount) {
      return `${service.price_amount}€`;
    }
    return 'Preis auf Anfrage';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link
            href={`/services/${serviceId}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Service
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
              Service bearbeiten
            </h1>
            <p className="mt-2 text-gray-600">
              Bearbeite die Details für {service.title}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <ServiceEditForm
              service={service}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">
                Service Informationen
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service ID:</span>
                  <span className="text-xs font-medium">#{service.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aufrufe:</span>
                  <span className="font-medium">{service.view_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interessenten:</span>
                  <span className="font-medium">{service.interest_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">
                    {service.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Typ:</span>
                  <span className="font-medium">
                    {service.is_offering ? 'Angebot' : 'Gesuch'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preis:</span>
                  <span className="font-medium">{getPriceDisplay()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">Zeitstempel</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="block text-gray-600">Erstellt:</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(service.created_at)}
                  </span>
                </div>
                {service.updated_at && (
                  <div>
                    <span className="block text-gray-600">Aktualisiert:</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(service.updated_at)}
                    </span>
                  </div>
                )}
                {service.is_completed && service.completed_at && (
                  <div>
                    <span className="block text-gray-600">Abgeschlossen:</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(service.completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {service.interest_count > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Hinweis:</strong> {service.interest_count}{' '}
                  {service.interest_count === 1
                    ? 'Person hat'
                    : 'Personen haben'}{' '}
                  bereits Interesse bekundet. Größere Änderungen sollten mit den
                  Interessenten abgesprochen werden.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Tipp:</strong> Änderungen werden sofort gespeichert und
                sind für alle Nutzer sichtbar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
