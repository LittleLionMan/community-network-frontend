import Link from 'next/link';
import { Lightbulb, ArrowRight, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { useServiceRecommendations } from '@/hooks/useServices';
import { useAuthStore } from '@/store/auth';

interface ServiceRecommendationsWidgetProps {
  limit?: number;
  onExpressInterest?: (serviceId: number) => void;
}

export function ServiceRecommendationsWidget({
  limit = 5,
  onExpressInterest,
}: ServiceRecommendationsWidgetProps) {
  const { isAuthenticated, user } = useAuthStore();
  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
  } = useServiceRecommendations(limit);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium text-gray-900">
            Das könnte dich interessieren
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium text-gray-900">
            Das könnte dich interessieren
          </h3>
        </div>

        {error ? (
          <div className="py-4 text-center">
            <p className="mb-3 text-sm text-gray-600">
              Empfehlungen konnten nicht geladen werden.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Erneut versuchen
            </Button>
          </div>
        ) : (
          <div className="py-6 text-center">
            <Lightbulb className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="mb-3 text-sm text-gray-600">
              Noch keine Empfehlungen verfügbar.
            </p>
            <p className="text-xs text-gray-500">
              Erstelle einen Service, um personalisierte Empfehlungen zu
              erhalten.
            </p>
          </div>
        )}
      </div>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'vor wenigen Minuten';
    if (diffInHours < 24) return `vor ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `vor ${diffInDays}d`;

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getServiceTypeColor = (isOffering: boolean) => {
    return isOffering
      ? 'text-green-600 bg-green-50'
      : 'text-blue-600 bg-blue-50';
  };

  const getServiceTypeText = (isOffering: boolean) => {
    return isOffering ? 'Bietet' : 'Sucht';
  };

  const handleExpressInterest = (serviceId: number) => {
    if (onExpressInterest) {
      onExpressInterest(serviceId);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium text-gray-900">
            Das könnte dich interessieren
          </h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetch()}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-4">
        {recommendations.map((service) => (
          <div key={service.id} className="group">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <ProfileAvatar user={service.user} size="sm" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getServiceTypeColor(service.is_offering)}`}
                  >
                    {getServiceTypeText(service.is_offering)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(service.created_at)}
                  </span>
                </div>

                <Link href={`/services/${service.id}`} className="block">
                  <h4 className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-community-600">
                    {service.title}
                  </h4>
                </Link>

                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                  {service.description}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      von {service.user.display_name}
                    </span>
                  </div>

                  {service.user.id !== user?.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExpressInterest(service.id)}
                      className="h-6 px-2 text-xs"
                    >
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Interesse
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <Link href="/services">
          <Button
            variant="ghost"
            size="sm"
            className="flex w-full items-center justify-center gap-2 text-sm"
          >
            Alle Services ansehen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
