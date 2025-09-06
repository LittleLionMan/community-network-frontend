import React from 'react';
import { Shield, AlertTriangle, X, Clock } from 'lucide-react';

interface SecurityBannerProps {
  isBlocked: boolean;
  blockReason: string | null;
  onClear: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const SecurityBanner: React.FC<SecurityBannerProps> = ({
  isBlocked,
  blockReason,
  onClear,
  type = 'error',
}) => {
  if (!isBlocked || !blockReason) return null;

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'border-l-4 border-yellow-400 bg-yellow-50 p-4',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          text: 'text-yellow-700',
          button: 'text-yellow-400 hover:text-yellow-600',
        };
      case 'info':
        return {
          container: 'border-l-4 border-blue-400 bg-blue-50 p-4',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          text: 'text-blue-700',
          button: 'text-blue-400 hover:text-blue-600',
        };
      default:
        return {
          container: 'border-l-4 border-red-400 bg-red-50 p-4',
          icon: 'text-red-400',
          title: 'text-red-800',
          text: 'text-red-700',
          button: 'text-red-400 hover:text-red-600',
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <Clock className={`h-5 w-5 ${styles.icon}`} />;
      case 'info':
        return <Shield className={`h-5 w-5 ${styles.icon}`} />;
      default:
        return <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'warning':
        return 'Warnung';
      case 'info':
        return 'Information';
      default:
        return 'Nachricht blockiert';
    }
  };

  return (
    <div className={styles.container}>
      <div className="flex items-center justify-between">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {getTitle()}
            </h3>
            <div className={`mt-1 text-sm ${styles.text}`}>
              <p>{blockReason}</p>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClear}
            className={`rounded-md p-1 ${styles.button} transition-colors`}
            title="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const SimpleSecurityBanner: React.FC<
  Pick<SecurityBannerProps, 'isBlocked' | 'blockReason' | 'onClear'>
> = ({ isBlocked, blockReason, onClear }) => {
  if (!isBlocked || !blockReason) return null;

  return (
    <div className="border-l-4 border-red-400 bg-red-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">Nachricht blockiert:</span>{' '}
              {blockReason}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="rounded-md p-1 text-red-400 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
