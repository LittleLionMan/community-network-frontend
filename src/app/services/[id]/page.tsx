'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Euro,
  MessageCircle,
  CheckCircle,
  Edit3,
  Eye,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ServiceRecommendationsWidget } from '@/components/services/ServiceRecommendationsWidget';
import { InterestExpressionModal } from '@/components/services/InterestExpressionModal';
import { ServiceDeleteButton } from '@/components/services/ServiceDeleteButton';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';

interface ServiceDetail {
  id: number;
  title: string;
  description: string;
  is_offering: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  service_image_url?: string;
  meeting_locations?: string[];
  view_count: number;
  interest_count: number;
  is_completed: boolean;
  completed_at?: string;
  price_type?: 'free' | 'paid' | 'negotiable' | 'exchange';
  price_amount?: number;
  price_currency: string;
  estimated_duration_hours?: number;
  contact_method: 'message' | 'phone' | 'email';
  response_time_hours?: number;
  user: {
    id: number;
    display_name: string;
    profile_image_url?: string;
    email_verified: boolean;
    created_at: string;
    location?: string;
    location_private: boolean;
  };
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const serviceId = parseInt(params.id as string);

  const [currentService, setCurrentService] = useState<ServiceDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        const response = (await apiClient.services.get(
          serviceId
        )) as ServiceDetail;
        setCurrentService(response);

        if (isAuthenticated && response.user.id !== user?.id) {
          await apiClient.services.incrementViewCount(serviceId);
          setCurrentService((prev) =>
            prev ? { ...prev, view_count: prev.view_count + 1 } : null
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Service nicht gefunden');
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId, isAuthenticated, user?.id]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ungültiges Datum';
      }
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Ungültiges Datum';
    }
  };

  const formatMemberSince = (dateString: string) => {
    if (!dateString) return 'Mitglied';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Mitglied';
      }
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Mitglied';
    }
  };

  const getPriceDisplay = () => {
    if (!currentService?.price_type || currentService.price_type === 'free') {
      return 'Kostenlos';
    }
    if (currentService.price_type === 'exchange') {
      return 'Tausch';
    }
    if (currentService.price_type === 'negotiable') {
      return 'Verhandelbar';
    }
    if (currentService.price_type === 'paid' && currentService.price_amount) {
      return `${currentService.price_amount}€`;
    }
    return 'Preis auf Anfrage';
  };

  const getDurationDisplay = () => {
    if (!currentService?.estimated_duration_hours) return null;

    const hours = currentService.estimated_duration_hours;
    if (hours < 1) {
      return `${Math.round(hours * 60)} Minuten`;
    }
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    }
    const days = Math.round(hours / 24);
    return `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
  };

  const getResponseTimeDisplay = () => {
    if (!currentService?.response_time_hours) return null;

    const hours = currentService.response_time_hours;
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    }
    const days = Math.round(hours / 24);
    return `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
  };

  const handleExpressInterest = async () => {
    if (!isAuthenticated) {
      toast.error(
        'Anmeldung erforderlich',
        'Du musst angemeldet sein, um Interesse zu bekunden.'
      );
      return;
    }

    if (!currentService) {
      toast.error('Fehler', 'Service konnte nicht geladen werden.');
      return;
    }

    if (currentService.user.id === user?.id) {
      toast.error(
        'Eigener Service',
        'Du kannst nicht an deinem eigenen Service interessiert sein.'
      );
      return;
    }

    try {
      const canMessageCheck = await apiClient.messages.checkCanMessageUser(
        currentService.user.id
      );

      if (!canMessageCheck.can_message) {
        toast.error(
          'Nachrichten nicht möglich',
          canMessageCheck.reason ||
            `${currentService.user.display_name} kann keine Nachrichten empfangen.`
        );
        return;
      }

      setShowInterestModal(true);
    } catch (error) {
      console.error('Can message check failed:', error);
      setShowInterestModal(true);
    }
  };

  const handleInterestSuccess = (newInterestCount?: number) => {
    console.log('Received new interest count:', newInterestCount);

    if (currentService && newInterestCount !== undefined) {
      console.log(
        'Updating interest count from',
        currentService.interest_count,
        'to',
        newInterestCount
      );
      setCurrentService({
        ...currentService,
        interest_count: newInterestCount,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-community-600 dark:text-community-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Service wird geladen...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentService) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/services" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Services
          </Link>
        </Button>

        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Service nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {error || 'Der angeforderte Service konnte nicht gefunden werden.'}
          </p>
          <Button asChild>
            <Link href="/services">Zu allen Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOwnService = user?.id === currentService.user.id;
  const canEdit = isAuthenticated && (isOwnService || user?.is_admin);
  const serviceTypeColor = currentService.is_offering
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  const serviceTypeText = currentService.is_offering ? 'Bietet an' : 'Sucht';

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/services" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Services
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {currentService.service_image_url && (
              <div className="relative h-64 w-full md:h-80">
                <img
                  src={currentService.service_image_url}
                  alt={currentService.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${serviceTypeColor}`}
                  >
                    {serviceTypeText}
                  </span>
                </div>
                {currentService.is_completed && (
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center rounded-full bg-gray-800 bg-opacity-75 px-3 py-1 text-sm font-medium text-white">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Abgeschlossen
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 sm:p-6">
              {!currentService.service_image_url && (
                <div className="mb-6 flex items-start justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${serviceTypeColor}`}
                  >
                    {serviceTypeText}
                  </span>
                  {currentService.is_completed && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Abgeschlossen
                    </span>
                  )}
                </div>
              )}

              <div className="mb-6">
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                      {currentService.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 sm:gap-4 sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Erstellt am {formatDate(currentService.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{currentService.view_count} Aufrufe</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {currentService.interest_count} Interessent
                          {currentService.interest_count !== 1 ? 'en' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/services/${currentService.id}/edit`}>
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </Button>

                      <ServiceDeleteButton
                        service={{
                          id: currentService.id,
                          title: currentService.title,
                          user: {
                            id: currentService.user.id,
                          },
                          interest_count: currentService.interest_count,
                        }}
                        onSuccess={() => router.push('/services')}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <Euro className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Preis
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getPriceDisplay()}
                    </p>
                  </div>
                </div>

                {currentService.estimated_duration_hours && (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Dauer
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getDurationDisplay()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Kontakt
                    </p>
                    <p className="text-sm capitalize text-gray-600 dark:text-gray-400">
                      {currentService.contact_method}
                    </p>
                  </div>
                </div>

                {currentService.response_time_hours && (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Antwortzeit
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ca. {getResponseTimeDisplay()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {currentService.meeting_locations &&
                currentService.meeting_locations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                      <MapPin className="h-5 w-5" />
                      Mögliche Treffpunkte
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentService.meeting_locations.map(
                        (location, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {location}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                  Beschreibung
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {currentService.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
                  Anbieter
                </h3>
                <div className="flex items-start gap-4">
                  <ProfileAvatar user={currentService.user} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {currentService.user.display_name}
                      </h4>
                      {currentService.user.email_verified && (
                        <span title="Email verifiziert">
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        </span>
                      )}
                    </div>

                    {currentService.user.created_at ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mitglied seit{' '}
                        {formatMemberSince(currentService.user.created_at)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mitglied
                      </p>
                    )}

                    {!currentService.user.location_private &&
                      currentService.user.location && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {currentService.user.location}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {!isOwnService &&
                isAuthenticated &&
                !currentService.is_completed && (
                  <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <Button
                      onClick={handleExpressInterest}
                      className="flex w-full items-center gap-2 sm:w-auto"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Interesse bekunden
                    </Button>
                  </div>
                )}

              {!isAuthenticated && (
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                    <p className="text-center text-sm text-blue-800 dark:text-blue-200">
                      <Link
                        href="/auth/login"
                        className="font-medium underline"
                      >
                        Melde dich an
                      </Link>{' '}
                      um Interesse an diesem Service zu bekunden.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <ServiceRecommendationsWidget
              limit={5}
              onExpressInterest={(serviceId) => {
                console.log('Express interest in service:', serviceId);
              }}
            />
          </div>
        </div>
      </div>

      {showInterestModal && currentService && (
        <InterestExpressionModal
          isOpen={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          service={{
            id: currentService.id,
            title: currentService.title,
            is_offering: currentService.is_offering,
            interest_count: currentService.interest_count,
            user: currentService.user,
            meeting_locations: currentService.meeting_locations,
          }}
          onSuccess={handleInterestSuccess}
        />
      )}
    </div>
  );
}
