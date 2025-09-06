import React from 'react';
import {
  AlertTriangle,
  RefreshCw,
  X,
  Shield,
  Clock,
  Info,
  AlertCircle,
} from 'lucide-react';
import { AppError, ErrorAction, ErrorRecovery } from '@/lib/error-handling';

interface ErrorDisplayProps {
  error: AppError;
  onDismiss?: (errorId: string) => void;
  onRetry?: () => void | Promise<void>;
  showActions?: boolean;
  compact?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  onRetry,
  showActions = true,
  compact = false,
}) => {
  const getStyles = () => {
    switch (error.severity) {
      case 'critical':
        return {
          container: 'border-l-4 border-red-500 bg-red-50 p-4',
          icon: 'text-red-500',
          title: 'text-red-800',
          text: 'text-red-700',
          button: 'bg-red-100 text-red-700 hover:bg-red-200',
          dismissButton: 'text-red-400 hover:text-red-600',
        };
      case 'high':
        return {
          container: 'border-l-4 border-orange-500 bg-orange-50 p-4',
          icon: 'text-orange-500',
          title: 'text-orange-800',
          text: 'text-orange-700',
          button: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
          dismissButton: 'text-orange-400 hover:text-orange-600',
        };
      case 'medium':
        return {
          container: 'border-l-4 border-yellow-400 bg-yellow-50 p-4',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          text: 'text-yellow-700',
          button: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
          dismissButton: 'text-yellow-400 hover:text-yellow-600',
        };
      case 'low':
        return {
          container: 'border-l-4 border-blue-400 bg-blue-50 p-4',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
          dismissButton: 'text-blue-400 hover:text-blue-600',
        };
      default:
        return {
          container: 'border-l-4 border-gray-400 bg-gray-50 p-4',
          icon: 'text-gray-500',
          title: 'text-gray-800',
          text: 'text-gray-700',
          button: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          dismissButton: 'text-gray-400 hover:text-gray-600',
        };
    }
  };

  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return <RefreshCw className={`h-5 w-5 ${styles.icon}`} />;
      case 'auth':
        return <Shield className={`h-5 w-5 ${styles.icon}`} />;
      case 'validation':
        return <AlertCircle className={`h-5 w-5 ${styles.icon}`} />;
      case 'permission':
        return <Shield className={`h-5 w-5 ${styles.icon}`} />;
      case 'server':
        return <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />;
      default:
        return <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />;
    }
  };

  const getTitle = () => {
    switch (error.type) {
      case 'network':
        return 'Verbindungsfehler';
      case 'auth':
        return 'Authentifizierungsfehler';
      case 'validation':
        return 'Eingabefehler';
      case 'permission':
        return 'Berechtigungsfehler';
      case 'server':
        return 'Serverfehler';
      default:
        return 'Fehler';
    }
  };

  const styles = getStyles();
  const recoveryActions = ErrorRecovery.getRecoveryActions(error);

  if (compact) {
    return (
      <div className={`rounded-md ${styles.container}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getIcon()}
            <p className={`ml-3 text-sm ${styles.text}`}>{error.userMessage}</p>
          </div>
          <div className="flex items-center space-x-2">
            {onRetry && error.retryable && (
              <button
                onClick={onRetry}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${styles.button}`}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Wiederholen
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(error.id)}
                className={`rounded-md p-1 transition-colors ${styles.dismissButton}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {getTitle()}
          </h3>
          <div className={`mt-1 text-sm ${styles.text}`}>
            <p>{error.userMessage}</p>
            {error.context && process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs opacity-70">
                  Debug Details
                </summary>
                <pre className="mt-1 text-xs opacity-70">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </details>
            )}
          </div>
          {showActions && (recoveryActions.length > 0 || onRetry) && (
            <div className="mt-4 flex space-x-2">
              {onRetry && error.retryable && (
                <button
                  onClick={onRetry}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${styles.button}`}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Wiederholen
                </button>
              )}
              {recoveryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    action.primary
                      ? styles.button
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => onDismiss(error.id)}
              className={`rounded-md p-1 transition-colors ${styles.dismissButton}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface ErrorListProps {
  errors: AppError[];
  onDismiss?: (errorId: string) => void;
  onRetry?: (errorId: string) => void | Promise<void>;
  maxVisible?: number;
  compact?: boolean;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  onDismiss,
  onRetry,
  maxVisible = 5,
  compact = false,
}) => {
  if (errors.length === 0) return null;

  const visibleErrors = errors.slice(0, maxVisible);
  const hiddenCount = errors.length - maxVisible;

  return (
    <div className="space-y-2">
      {visibleErrors.map((error) => (
        <ErrorDisplay
          key={error.id}
          error={error}
          onDismiss={onDismiss}
          onRetry={onRetry ? () => onRetry(error.id) : undefined}
          compact={compact}
        />
      ))}
      {hiddenCount > 0 && (
        <div className="text-center text-sm text-gray-500">
          ... und {hiddenCount} weitere Fehler
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryFallbackProps {
  error: AppError;
  resetError: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => {
  const recoveryActions = ErrorRecovery.getRecoveryActions(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Etwas ist schiefgelaufen
          </h2>
          <p className="mt-2 text-gray-600">{error.userMessage}</p>

          {error.context && process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Debug Information
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                {JSON.stringify(
                  {
                    type: error.type,
                    message: error.message,
                    context: error.context,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}

          <div className="mt-6 space-y-2">
            <button
              onClick={resetError}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              Erneut versuchen
            </button>

            {recoveryActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ErrorToastProps {
  error: AppError;
  onDismiss: (errorId: string) => void;
  duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  duration = 5000,
}) => {
  React.useEffect(() => {
    if (error.severity === 'low' || error.severity === 'medium') {
      const timer = setTimeout(() => {
        onDismiss(error.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error.id, error.severity, onDismiss, duration]);

  const getSeverityColor = () => {
    switch (error.severity) {
      case 'critical':
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`h-2 w-2 rounded-full ${getSeverityColor()}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {error.type === 'network' ? 'Verbindungsfehler' : 'Fehler'}
            </p>
            <p className="mt-1 text-sm text-gray-500">{error.userMessage}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={() => onDismiss(error.id)}
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
