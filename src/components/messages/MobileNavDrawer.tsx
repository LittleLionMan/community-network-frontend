'use client';

import React from 'react';
import {
  X,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isReconnecting: boolean;
  tokenExpiring: boolean;
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
  unreadCount: number;
  onOpenSettings: () => void;
  onReconnect: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  isConnected,
  isReconnecting,
  tokenExpiring,
  notificationsEnabled,
  notificationsSupported,
  unreadCount,
  onOpenSettings,
  onReconnect,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-xl transition-transform md:hidden">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Menü</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Status</h3>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Wifi className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <WifiOff className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Verbindung
                  </p>
                  <p className="text-xs text-gray-600">
                    {isConnected
                      ? tokenExpiring
                        ? 'Sitzung läuft ab'
                        : 'Online'
                      : isReconnecting
                        ? 'Verbinde...'
                        : 'Offline'}
                  </p>
                </div>
              </div>
              {isReconnecting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
              )}
            </div>

            {!isConnected && !isReconnecting && (
              <button
                onClick={() => {
                  onReconnect();
                  onClose();
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-indigo-600 p-3 text-white hover:bg-indigo-700 active:bg-indigo-800"
              >
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Neu verbinden</span>
              </button>
            )}

            {tokenExpiring && (
              <div className="flex items-start space-x-3 rounded-lg bg-orange-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    Sitzung läuft bald ab
                  </p>
                  <p className="text-xs text-orange-700">
                    Bitte authentifiziere dich erneut
                  </p>
                </div>
              </div>
            )}

            {notificationsSupported && (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div className="flex items-center space-x-3">
                  {notificationsEnabled ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <BellOff className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Benachrichtigungen
                    </p>
                    <p className="text-xs text-gray-600">
                      {notificationsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {unreadCount > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                    <span className="text-sm font-semibold text-indigo-600">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Ungelesene Nachrichten
                    </p>
                    <p className="text-xs text-gray-600">
                      {unreadCount} neue{' '}
                      {unreadCount === 1 ? 'Nachricht' : 'Nachrichten'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Aktionen</h3>

            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="flex w-full items-center space-x-3 rounded-lg p-3 text-left hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Einstellungen
                </p>
                <p className="text-xs text-gray-600">
                  Privacy & Benachrichtigungen
                </p>
              </div>
            </button>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-xs text-blue-900">
                  Du kannst diese Ansicht jederzeit über das Menü-Icon oben
                  links öffnen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
