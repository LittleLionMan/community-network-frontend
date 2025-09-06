import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface MessageErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const MessageError: React.FC<MessageErrorProps> = ({
  error,
  onRetry,
  onDismiss,
  type = 'error',
}) => {
  const colors = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[type]}`}>
      <div className="flex items-start">
        <AlertTriangle
          className={`mr-3 h-5 w-5 ${iconColors[type]} flex-shrink-0`}
        />

        <div className="flex-1">
          <p className="text-sm font-medium">
            {type === 'error' && 'Fehler'}
            {type === 'warning' && 'Warnung'}
            {type === 'info' && 'Information'}
          </p>
          <p className="mt-1 text-sm">{error}</p>
        </div>

        <div className="ml-3 flex space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                type === 'error'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : type === 'warning'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Wiederholen
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`rounded-md p-1 transition-colors ${
                type === 'error'
                  ? 'text-red-400 hover:text-red-600'
                  : type === 'warning'
                    ? 'text-yellow-400 hover:text-yellow-600'
                    : 'text-blue-400 hover:text-blue-600'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
