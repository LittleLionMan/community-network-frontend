import Link from 'next/link';
import {
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { InterestExpressionModal } from './InterestExpressionModal';
import { useAuthStore } from '@/store/auth';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

interface ServiceCardProps {
  service: {
    id: number;
    slug?: string;
    title: string;
    description: string;
    is_offering: boolean;
    created_at: string;
    service_type?: string;
    user: {
      id: number;
      display_name: string;
      profile_image_url?: string;
      email_verified: boolean;
      created_at: string;
      exact_address?: string;
      exact_address_private: boolean;
    };
    service_image_url?: string;
  };
  variant?: 'card' | 'list';
  showInterestButton?: boolean;
  currentUserId?: number;
  onExpressInterest?: (serviceId: number, newInterestCount?: number) => void;
}

export function ServiceCard({
  service,
  variant = 'card',
  showInterestButton = true,
  currentUserId,
  onExpressInterest,
}: ServiceCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [showInterestModal, setShowInterestModal] = useState(false);
  const isOwnService = currentUserId === service.user.id;
  const isPlatformFeature = service.service_type === 'platform_feature';

  const serviceUrl = service.slug
    ? `/services/${service.slug}`
    : `/services/${service.id}`;

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
    });
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getServiceTypeColor = (isOffering: boolean) => {
    return isOffering
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getServiceTypeText = (isOffering: boolean) => {
    return isOffering ? 'Bietet an' : 'Sucht';
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleExpressInterest = async () => {
    if (!isAuthenticated) {
      toast.error(
        'Anmeldung erforderlich',
        'Du musst angemeldet sein, um Interesse zu bekunden.'
      );
      return;
    }

    if (service.user.id === user?.id) {
      toast.error(
        'Eigener Service',
        'Du kannst nicht an deinem eigenen Service interessiert sein.'
      );
      return;
    }

    try {
      const canMessageCheck = await apiClient.messages.checkCanMessageUser(
        service.user.id
      );

      if (!canMessageCheck.can_message) {
        toast.error(
          'Nachrichten nicht möglich',
          canMessageCheck.reason ||
            `${service.user.display_name} kann keine Nachrichten empfangen.`
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
    toast.success(
      'Nachricht gesendet!',
      `Deine Nachricht wurde an ${service.user.display_name} gesendet.`
    );

    if (onExpressInterest && newInterestCount !== undefined) {
      onExpressInterest(service.id, newInterestCount);
    }
  };

  if (variant === 'list') {
    return (
      <div className="border-b border-gray-200 py-4 dark:border-gray-700">
        <div className="flex gap-4">
          {service.service_image_url && (
            <div className="flex-shrink-0">
              <img
                src={service.service_image_url}
                alt={service.title}
                className="h-16 w-16 rounded-lg object-cover"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {isPlatformFeature && (
                    <Sparkles className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  )}
                  {!isPlatformFeature && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getServiceTypeColor(service.is_offering)}`}
                    >
                      {getServiceTypeText(service.is_offering)}
                    </span>
                  )}
                </div>

                <Link href={serviceUrl} className="group mt-2 block">
                  <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-community-600 dark:text-gray-100 dark:group-hover:text-community-400">
                    {service.title}
                  </h3>
                </Link>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {truncateDescription(service.description)}
                </p>

                {!isPlatformFeature && (
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatCreatedAt(service.created_at)}</span>
                    </div>

                    {!service.user.exact_address_private &&
                      service.user.exact_address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{service.user.exact_address}</span>
                        </div>
                      )}

                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Mitglied seit{' '}
                        {formatMemberSince(service.user.created_at)}
                      </span>
                    </div>
                  </div>
                )}

                {!isPlatformFeature && (
                  <div className="mt-2 flex items-center gap-2">
                    <ProfileAvatar user={service.user} size="sm" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {service.user.display_name}
                      </span>
                      {service.user.email_verified && (
                        <span title="Email verifiziert">
                          <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {showInterestButton && !isOwnService && !isPlatformFeature && (
                <Button
                  size="sm"
                  onClick={handleExpressInterest}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Interesse
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border transition-shadow hover:shadow-md ${
        isPlatformFeature
          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      {service.service_image_url && (
        <div className="relative h-48 w-full">
          <img
            src={service.service_image_url}
            alt={service.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-2 top-2">
            {isPlatformFeature ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
                Platform Feature
              </span>
            ) : (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ${getServiceTypeColor(service.is_offering)}`}
              >
                {getServiceTypeText(service.is_offering)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {!service.service_image_url && (
          <div className="mb-3 flex items-center gap-2">
            {isPlatformFeature ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-medium text-white">
                <Sparkles className="h-3 w-3" />
                Platform Feature
              </span>
            ) : (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getServiceTypeColor(service.is_offering)}`}
              >
                {getServiceTypeText(service.is_offering)}
              </span>
            )}
          </div>
        )}

        <Link href={serviceUrl} className="group block">
          <h3
            className={`mb-2 font-semibold transition-colors ${
              isPlatformFeature
                ? 'text-amber-900 group-hover:text-amber-700 dark:text-amber-100 dark:group-hover:text-amber-300'
                : 'text-gray-900 group-hover:text-community-600 dark:text-gray-100 dark:group-hover:text-community-400'
            }`}
          >
            {service.title}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
          {service.description}
        </p>

        {!isPlatformFeature && (
          <>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{formatCreatedAt(service.created_at)}</span>
              </div>

              {!service.user.exact_address_private &&
                service.user.exact_address && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {service.user.exact_address}
                    </span>
                  </div>
                )}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>
                  Mitglied seit {formatMemberSince(service.user.created_at)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ProfileAvatar user={service.user} size="sm" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm text-gray-600 dark:text-gray-400">
                    {service.user.display_name}
                  </span>
                  {service.user.email_verified && (
                    <span title="Email verifiziert" className="flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                    </span>
                  )}
                </div>
              </div>

              {showInterestButton && !isOwnService && (
                <Button
                  size="sm"
                  onClick={handleExpressInterest}
                  className="flex flex-shrink-0 items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Interesse</span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      {showInterestModal && (
        <InterestExpressionModal
          isOpen={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          service={{
            id: service.id,
            title: service.title,
            is_offering: service.is_offering,
            interest_count: 0,
            user: service.user,
            meeting_locations: undefined,
          }}
          onSuccess={handleInterestSuccess}
        />
      )}
    </div>
  );
}
