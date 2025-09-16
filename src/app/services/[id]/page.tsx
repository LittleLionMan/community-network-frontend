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
  Trash2,
  Eye,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ServiceRecommendationsWidget } from '@/components/services/ServiceRecommendationsWidget';
import { InterestExpressionModal } from '@/components/services/InterestExpressionModal';
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

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        const response = (await apiClient.services.get(
          serviceId
        )) as ServiceDetail;
        setService(response);

        if (isAuthenticated && response.user.id !== user?.id) {
          await apiClient.services.incrementViewCount(serviceId);
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
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
    });
  };

  const getPriceDisplay = () => {
    if (!service?.price_type || service.price_type === 'free') {
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

  const getDurationDisplay = () => {
    if (!service?.estimated_duration_hours) return null;

    const hours = service.estimated_duration_hours;
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
    if (!service?.response_time_hours) return null;

    const hours = service.response_time_hours;
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

    if (service?.user.id === user?.id) {
      toast.error(
        'Eigener Service',
        'Du kannst nicht an deinem eigenen Service interessiert sein.'
      );
      return;
    }

    setShowInterestModal(true);
  };

  const handleInterestSuccess = () => {
    if (service) {
      setService({
        ...service,
        interest_count: service.interest_count + 1,
      });
    }
  };

  const handleDelete = async () => {
    if (!service || !window.confirm('Service wirklich löschen?')) return;

    try {
      await apiClient.services.delete(service.id);
      toast.success(
        'Service gelöscht',
        'Der Service wurde erfolgreich gelöscht.'
      );
      router.push('/services');
    } catch (error) {
      toast.error(
        'Fehler beim Löschen',
        'Der Service konnte nicht gelöscht werden.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-community-600" />
            <p className="text-gray-600">Service wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Service nicht gefunden
          </h3>
          <p className="mb-4 text-gray-600">
            {error || 'Der angeforderte Service konnte nicht gefunden werden.'}
          </p>
          <Button asChild>
            <Link href="/services">Zu allen Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOwnService = user?.id === service.user.id;
  const serviceTypeColor = service.is_offering
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800';
  const serviceTypeText = service.is_offering ? 'Bietet an' : 'Sucht';

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
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {service.service_image_url && (
              <div className="relative h-64 w-full md:h-80">
                <img
                  src={service.service_image_url}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${serviceTypeColor}`}
                  >
                    {serviceTypeText}
                  </span>
                </div>
                {service.is_completed && (
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center rounded-full bg-gray-800 bg-opacity-75 px-3 py-1 text-sm font-medium text-white">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Abgeschlossen
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              {!service.service_image_url && (
                <div className="mb-6 flex items-start justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${serviceTypeColor}`}
                  >
                    {serviceTypeText}
                  </span>
                  {service.is_completed && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Abgeschlossen
                    </span>
                  )}
                </div>
              )}

              <div className="mb-6 flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {service.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Erstellt am {formatDate(service.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{service.view_count} Aufrufe</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {service.interest_count} Interessent
                        {service.interest_count !== 1 ? 'en' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {isOwnService && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/services/${service.id}/edit`}>
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                  <Euro className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Preis</p>
                    <p className="text-sm text-gray-600">{getPriceDisplay()}</p>
                  </div>
                </div>

                {service.estimated_duration_hours && (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dauer</p>
                      <p className="text-sm text-gray-600">
                        {getDurationDisplay()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Kontakt</p>
                    <p className="text-sm capitalize text-gray-600">
                      {service.contact_method}
                    </p>
                  </div>
                </div>

                {service.response_time_hours && (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Antwortzeit
                      </p>
                      <p className="text-sm text-gray-600">
                        ca. {getResponseTimeDisplay()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {service.meeting_locations &&
                service.meeting_locations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                      <MapPin className="h-5 w-5" />
                      Mögliche Treffpunkte
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.meeting_locations.map((location, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Beschreibung
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-4 font-semibold text-gray-900">Anbieter</h3>
                <div className="flex items-start gap-4">
                  <ProfileAvatar user={service.user} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {service.user.display_name}
                      </h4>
                      {service.user.email_verified && (
                        <span title="Email verifiziert">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Mitglied seit {formatMemberSince(service.user.created_at)}
                    </p>
                    {!service.user.location_private &&
                      service.user.location && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {service.user.location}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {!isOwnService && isAuthenticated && !service.is_completed && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <Button
                    onClick={handleExpressInterest}
                    disabled={isExpressingInterest}
                    className="flex w-full items-center gap-2 sm:w-auto"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Interesse bekunden
                  </Button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-center text-sm text-blue-800">
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

      {showInterestModal && service && (
        <InterestExpressionModal
          isOpen={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          service={{
            id: service.id,
            title: service.title,
            is_offering: service.is_offering,
            user: service.user,
            meeting_locations: service.meeting_locations,
          }}
          onSuccess={handleInterestSuccess}
        />
      )}
    </div>
  );
}
