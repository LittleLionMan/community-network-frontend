import React, { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationPermissionBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const { permissionState, requestPermission } = useNotifications();

  if (
    !permissionState.isSupported ||
    permissionState.permission === 'granted' ||
    permissionState.permission === 'denied' ||
    !isVisible
  ) {
    return null;
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const permission = await requestPermission();
      if (permission === 'granted') {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="relative border-b border-blue-200 bg-blue-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-blue-900">
              Benachrichtigungen aktivieren
            </div>
            <div className="text-sm text-blue-800">
              Verpasse keine neuen Nachrichten - aktiviere
              Browser-Benachrichtigungen
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="flex items-center space-x-1 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isRequesting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>{isRequesting ? 'Wird aktiviert...' : 'Aktivieren'}</span>
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="rounded-md p-1 text-blue-600 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
