import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { WebSocketAuthError } from '@/types/websocket';

interface AuthErrorBannerProps {
  error: WebSocketAuthError;
  onRetry?: () => void;
  onDismiss?: () => void;
  tokenExpiring?: boolean;
  expiresIn?: number;
}

export const AuthErrorBanner: React.FC<AuthErrorBannerProps> = ({
  error,
  onRetry,
  onDismiss,
  tokenExpiring,
  expiresIn,
}) => {
  const getSeverityStyles = (severity: WebSocketAuthError['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-400 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-400 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-400 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-400 bg-gray-50 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (error.type) {
      case 'token_expired':
      case 'token_refresh_failed':
        return <AlertTriangle className="h-5 w-5" />;
      case 'connection_lost':
      case 'heartbeat_timeout':
        return <RefreshCw className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getMessage = () => {
    if (tokenExpiring && expiresIn) {
      const minutes = Math.ceil(expiresIn / 60);
      return `Deine Sitzung läuft in ${minutes} Minute(n) ab. Bitte authentifiziere dich erneut.`;
    }
    return error.message;
  };

  const getTitle = () => {
    if (tokenExpiring) return 'Sitzung läuft ab';

    switch (error.type) {
      case 'token_expired':
        return 'Sitzung abgelaufen';
      case 'token_refresh_failed':
        return 'Authentifizierung fehlgeschlagen';
      case 'connection_lost':
        return 'Verbindung verloren';
      case 'heartbeat_timeout':
        return 'Verbindung unterbrochen';
      default:
        return 'Verbindungsproblem';
    }
  };

  return (
    <div
      className={`mx-4 rounded-lg border-l-4 p-4 ${getSeverityStyles(error.severity)}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{getTitle()}</h3>
          <p className="mt-1 text-sm">{getMessage()}</p>
          <div className="mt-3 flex space-x-2">
            {error.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center space-x-1 rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Erneut versuchen</span>
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center space-x-1 rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X className="h-4 w-4" />
                <span>Ausblenden</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
