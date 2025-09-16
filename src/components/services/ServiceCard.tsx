import Link from 'next/link';
import {
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    is_offering: boolean;
    created_at: string;
    user: {
      id: number;
      display_name: string;
      profile_image_url?: string;
      email_verified: boolean;
      created_at: string;
      location?: string;
      location_private: boolean;
    };
    service_image_url?: string;
  };
  variant?: 'card' | 'list';
  showInterestButton?: boolean;
  currentUserId?: number;
  onExpressInterest?: (serviceId: number) => void;
}

export function ServiceCard({
  service,
  variant = 'card',
  showInterestButton = true,
  currentUserId,
  onExpressInterest,
}: ServiceCardProps) {
  const isOwnService = currentUserId === service.user.id;

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
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const getServiceTypeText = (isOffering: boolean) => {
    return isOffering ? 'Bietet an' : 'Sucht';
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleExpressInterest = () => {
    if (onExpressInterest && !isOwnService) {
      onExpressInterest(service.id);
    }
  };

  if (variant === 'list') {
    return (
      <div className="border-b border-gray-200 py-4">
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
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getServiceTypeColor(service.is_offering)}`}
                >
                  {getServiceTypeText(service.is_offering)}
                </span>

                <Link
                  href={`/services/${service.id}`}
                  className="group mt-2 block"
                >
                  <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-community-600">
                    {service.title}
                  </h3>
                </Link>

                <p className="mt-1 text-sm text-gray-600">
                  {truncateDescription(service.description)}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatCreatedAt(service.created_at)}</span>
                  </div>

                  {!service.user.location_private && service.user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{service.user.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Mitglied seit {formatMemberSince(service.user.created_at)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <ProfileAvatar user={service.user} size="sm" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {service.user.display_name}
                    </span>
                    {service.user.email_verified && (
                      <span title="Email verifiziert">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {showInterestButton && !isOwnService && (
                <div className="flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExpressInterest}
                    className="flex items-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Interesse
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {service.service_image_url && (
        <div className="relative h-48 w-full">
          <img
            src={service.service_image_url}
            alt={service.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getServiceTypeColor(service.is_offering)}`}
            >
              {getServiceTypeText(service.is_offering)}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        {!service.service_image_url && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getServiceTypeColor(service.is_offering)}`}
            >
              {getServiceTypeText(service.is_offering)}
            </span>
          </div>
        )}

        <Link href={`/services/${service.id}`} className="group block">
          <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-community-600">
            {service.title}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
          {service.description}
        </p>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>{formatCreatedAt(service.created_at)}</span>
          </div>

          {!service.user.location_private && service.user.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{service.user.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>
              Mitglied seit {formatMemberSince(service.user.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ProfileAvatar user={service.user} size="sm" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {service.user.display_name}
              </span>
              {service.user.email_verified && (
                <span title="Email verifiziert">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </span>
              )}
            </div>
          </div>

          {showInterestButton && !isOwnService && (
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
  );
}
