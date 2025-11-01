'use client';

import React, { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';

interface MobileHeaderProps {
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

export const MobileHeader: React.FC<MobileHeaderProps> = ({
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900">Nachrichten</h1>

          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <button
          onClick={onNewMessage}
          disabled={!messagesEnabled}
          className={`flex items-center justify-center rounded-full p-2 shadow-md transition-all active:scale-95 ${
            messagesEnabled
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
          aria-label="Neue Nachricht"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
        tokenExpiring={tokenExpiring}
        notificationsEnabled={notificationsEnabled}
        notificationsSupported={notificationsSupported}
        unreadCount={unreadCount}
        onOpenSettings={onOpenSettings}
        onReconnect={onReconnect}
      />
    </>
  );
};
