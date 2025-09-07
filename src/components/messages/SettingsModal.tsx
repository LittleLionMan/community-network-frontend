'use client';

import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Users,
  Bell,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useMessagePrivacy } from '@/hooks/useMessages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationsEnabled: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
}

const SettingsModal = React.memo<SettingsModalProps>(
  ({ isOpen, onClose, notificationsEnabled, isConnected, isReconnecting }) => {
    const { settings, isLoading, updateSettings } = useMessagePrivacy();
    const [updating, setUpdating] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<{
      type: 'success' | 'error' | null;
      message: string;
    }>({ type: null, message: '' });

    const handleToggle = async (setting: string, value: boolean) => {
      setUpdating(setting);
      setSaveStatus({ type: null, message: '' });

      try {
        await updateSettings({ [setting]: value });
        setSaveStatus({
          type: 'success',
          message: 'Einstellungen erfolgreich gespeichert',
        });

        setTimeout(() => {
          setSaveStatus({ type: null, message: '' });
        }, 2000);
      } catch (error) {
        console.error('Failed to update message privacy settings:', error);
        setSaveStatus({
          type: 'error',
          message: 'Fehler beim Speichern der Einstellungen',
        });
      } finally {
        setUpdating(null);
      }
    };

    if (!isOpen) return null;

    const privacySettings = [
      {
        key: 'messages_enabled',
        icon: MessageCircle,
        title: 'Nachrichten aktiviert',
        description: 'Erlaube anderen dir zu schreiben',
        value: settings.messages_enabled ?? true,
        disabled: false,
      },
      {
        key: 'messages_from_strangers',
        icon: Users,
        title: 'Von Fremden',
        description: 'Nachrichten von unbekannten Personen',
        value: settings.messages_from_strangers ?? true,
        disabled: !settings.messages_enabled,
      },
      {
        key: 'messages_notifications',
        icon: Bell,
        title: 'Nachrichten-Benachrichtigungen',
        description: 'Benachrichtigungen bei neuen Nachrichten',
        value: settings.messages_notifications ?? true,
        disabled: true, //to do
      },
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Nachrichten-Einstellungen
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoading && (
              <div className="mb-4 flex items-center justify-center rounded-lg bg-gray-50 p-4">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
                <span className="text-gray-600">Lade Einstellungen...</span>
              </div>
            )}

            {saveStatus.type && (
              <div
                className={`mb-4 flex items-center rounded-lg p-3 ${
                  saveStatus.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {saveStatus.type === 'success' ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-2 h-4 w-4" />
                )}
                <span className="text-sm">{saveStatus.message}</span>
              </div>
            )}

            <div className="space-y-4">
              {privacySettings.map((setting) => {
                const Icon = setting.icon;
                const isUpdating = updating === setting.key;

                return (
                  <div
                    key={setting.key}
                    className={`flex items-center justify-between transition-opacity ${
                      setting.disabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {setting.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {setting.description}
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      {isUpdating && (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
                      )}
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={setting.value}
                          onChange={(e) =>
                            handleToggle(setting.key, e.target.checked)
                          }
                          disabled={setting.disabled || isUpdating || isLoading}
                          className="sr-only"
                        />
                        <div
                          className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${setting.value ? 'bg-indigo-600' : 'bg-gray-200'} ${setting.disabled || isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
                        >
                          <div
                            className={`absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${setting.value ? 'translate-x-5' : 'translate-x-0'} `}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                );
              })}

              {!isLoading && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="text-sm text-blue-800">
                    <div className="mb-1 font-medium text-blue-900">
                      Aktueller Status:
                    </div>
                    <div>
                      {!settings.messages_enabled
                        ? 'Nachrichten sind deaktiviert.'
                        : !settings.messages_from_strangers
                          ? 'Du erhältst nur Nachrichten von bekannten Kontakten.'
                          : 'Du erhältst Nachrichten von allen Community-Mitgliedern.'}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>WebSocket Status:</span>
                    <span
                      className={
                        isConnected ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {isConnected ? 'Verbunden' : 'Getrennt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reconnecting:</span>
                    <span>{isReconnecting ? 'Ja' : 'Nein'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={updating !== null}
              >
                {updating ? 'Speichere...' : 'Schließen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SettingsModal.displayName = 'SettingsModal';

export default SettingsModal;
