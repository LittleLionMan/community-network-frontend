'use client';

import React from 'react';
import { Plus, Settings } from 'lucide-react';

interface DesktopHeaderProps {
  unreadCount: number;
  isConnected: boolean;
  isReconnecting: boolean;
  tokenExpiring: boolean;
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
  onNewMessage: () => void;
  onOpenSettings: () => void;
  onReconnect: () => void;
  messagesEnabled: boolean;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  unreadCount,
  isConnected,
  isReconnecting,
  tokenExpiring,
  notificationsEnabled,
  notificationsSupported,
  onNewMessage,
  onOpenSettings,
  onReconnect,
  messagesEnabled,
}) => {
  return (
    <div className="hidden items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:flex">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">Nachrichten</h1>

        {unreadCount > 0 && (
          <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        <div
          className={`flex items-center space-x-1 text-xs ${
            isConnected ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            } ${isReconnecting ? 'animate-pulse' : ''}`}
          />
          <span>
            {isConnected
              ? tokenExpiring
                ? 'Sitzung läuft ab'
                : 'Online'
              : isReconnecting
                ? 'Verbinde...'
                : 'Offline'}
          </span>
        </div>

        {tokenExpiring && (
          <div className="flex items-center space-x-1 text-xs text-orange-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
            <span>Token läuft ab</span>
          </div>
        )}

        {notificationsSupported && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              notificationsEnabled ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                notificationsEnabled ? 'bg-blue-500' : 'bg-gray-400'
              }`}
            />
            <span>
              {notificationsEnabled
                ? 'Benachrichtigungen an'
                : 'Benachrichtigungen aus'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={onNewMessage}
            disabled={!messagesEnabled}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
              messagesEnabled
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
            title={
              !messagesEnabled
                ? 'Du hast Nachrichten in deinen Einstellungen deaktiviert'
                : undefined
            }
          >
            <Plus className="h-4 w-4" />
            <span>Neue Nachricht</span>
          </button>

          {!messagesEnabled && (
            <div className="absolute bottom-full left-1/2 mb-2 hidden w-48 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs text-white group-hover:block">
              Du musst Nachrichten in deinen Privacy-Einstellungen aktivieren
              <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Einstellungen"
        >
          <Settings className="h-5 w-5" />
        </button>

        {!isConnected && (
          <button
            onClick={onReconnect}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={isReconnecting}
          >
            {isReconnecting ? 'Verbinde...' : 'Reconnect'}
          </button>
        )}
      </div>
    </div>
  );
};
