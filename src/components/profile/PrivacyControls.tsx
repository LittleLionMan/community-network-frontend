'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, MessageCircle, Users } from 'lucide-react';
import type { User } from '@/types';
import {
  useMessagePrivacy,
  useUpdateMessagePrivacy,
} from '@/hooks/useMessagePrivacyApi';
import { NotificationPrivacyControls } from '@/components/notifications/NotificationPrivacyControls';

interface PrivacyControlsProps {
  user: User;
  onPrivacyChange: (field: string, value: boolean) => void;
  showPreview: () => void;
  isLoading?: boolean;
}

interface MessagePrivacyControlsProps {
  onSettingsChange: (settings: Record<string, boolean>) => void;
}

const MessagePrivacyControls: React.FC<MessagePrivacyControlsProps> = ({
  onSettingsChange,
}) => {
  const { data: settings, isLoading, refetch } = useMessagePrivacy();
  const updatePrivacy = useUpdateMessagePrivacy();

  const [localMessagesEnabled, setLocalMessagesEnabled] = useState<
    boolean | null
  >(null);
  const [localMessagesFromStrangers, setLocalMessagesFromStrangers] = useState<
    boolean | null
  >(null);

  const messagesEnabled =
    localMessagesEnabled !== null
      ? localMessagesEnabled
      : (settings?.messages_enabled ?? true);
  const messagesFromStrangers =
    localMessagesFromStrangers !== null
      ? localMessagesFromStrangers
      : (settings?.messages_from_strangers ?? true);

  useEffect(() => {
    if (settings) {
      setLocalMessagesEnabled(settings.messages_enabled ?? true);
      setLocalMessagesFromStrangers(settings.messages_from_strangers ?? true);
    }
  }, [settings]);

  const handleToggle = async (setting: string, value: boolean) => {
    if (setting === 'messages_enabled') {
      setLocalMessagesEnabled(value);
    } else if (setting === 'messages_from_strangers') {
      setLocalMessagesFromStrangers(value);
    }

    try {
      await updatePrivacy.mutateAsync({ [setting]: value });
      onSettingsChange({ [setting]: value });
      await refetch();
    } catch (error) {
      console.error('Failed to update message privacy settings:', error);
      await refetch();
      if (settings) {
        setLocalMessagesEnabled(settings.messages_enabled ?? true);
        setLocalMessagesFromStrangers(settings.messages_from_strangers ?? true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
          <MessageCircle className="mr-2 h-5 w-5" />
          Nachrichten-Privatsphäre
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Bestimme, wer dir Nachrichten senden kann und wie du benachrichtigt
          wirst.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="flex items-start space-x-3">
            <MessageCircle className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Nachrichten aktiviert
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Andere Community-Mitglieder können dir private Nachrichten
                senden
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={messagesEnabled}
              onChange={(e) =>
                handleToggle('messages_enabled', e.target.checked)
              }
              disabled={updatePrivacy.isPending}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:bg-gray-700 dark:peer-checked:bg-indigo-500"></div>
          </label>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg p-4 transition-opacity ${
            messagesEnabled
              ? 'bg-gray-50 dark:bg-gray-800'
              : 'bg-gray-100 opacity-50 dark:bg-gray-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            <Users className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Nachrichten von Fremden
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Auch Personen, mit denen du noch nie geschrieben hast, können
                dir schreiben
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={messagesFromStrangers}
              onChange={(e) =>
                handleToggle('messages_from_strangers', e.target.checked)
              }
              disabled={!messagesEnabled || updatePrivacy.isPending}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:bg-gray-700 dark:peer-checked:bg-indigo-500"></div>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start space-x-3">
          <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="mb-1 font-medium text-blue-900 dark:text-blue-200">
              Nachrichten-Tipp
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              {messagesEnabled
                ? messagesFromStrangers
                  ? 'Du erhältst Nachrichten von allen Community-Mitgliedern.'
                  : 'Du erhältst nur Nachrichten von Personen, mit denen du bereits geschrieben hast.'
                : 'Nachrichten sind deaktiviert. Andere können dir keine privaten Nachrichten senden.'}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 text-yellow-600 dark:text-yellow-400">
            ⚠️
          </div>
          <div>
            <div className="mb-1 font-medium text-yellow-900 dark:text-yellow-200">
              Wichtiger Hinweis
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-300">
              Administratoren können dir auch bei deaktivierten Nachrichten
              schreiben, um wichtige Community-Informationen zu übermitteln.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function PrivacyControls({
  user,
  onPrivacyChange,
  showPreview,
  isLoading,
}: PrivacyControlsProps) {
  const [activeSection, setActiveSection] = useState<
    'profile' | 'messages' | 'notifications'
  >('profile');

  const handleMessageSettingsChange = (settings: Record<string, boolean>) => {
    console.log('Message settings changed:', settings);
  };

  const privacyFields = [
    {
      key: 'email_private',
      label: 'Email-Adresse',
      value: user.email,
      description: 'Nur für Organisatoren bei Event-Teilnahme sichtbar',
    },
    {
      key: 'first_name_private',
      label: 'Vorname',
      value: user.first_name,
      description: 'Hilft anderen dich zu erkennen',
    },
    {
      key: 'last_name_private',
      label: 'Nachname',
      value: user.last_name,
      description: 'Für vertrauensvolle Community-Interaktionen',
    },
    {
      key: 'bio_private',
      label: 'Bio',
      value: user.bio,
      description: 'Erzähle anderen von deinen Interessen',
    },
    {
      key: 'exact_address_private',
      label: 'Standort',
      value: user.exact_address,
      description: 'Hilft bei lokalen Events und Services',
    },
    {
      key: 'created_at_private',
      label: 'Beitrittsdatum',
      value: user.created_at
        ? new Date(user.created_at).toLocaleDateString('de-DE')
        : '',
      description: 'Zeigt wie lange du Teil der Community bist',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Privacy-Einstellungen
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Kontrolliere, welche Informationen andere sehen können und wer dir
          schreiben darf.
        </p>

        <div className="mb-6 hidden space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 md:flex">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeSection === 'profile'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Profil-Sichtbarkeit
          </button>
          <button
            onClick={() => setActiveSection('messages')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeSection === 'messages'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Nachrichten-Privatsphäre
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeSection === 'notifications'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Forum-Benachrichtigungen
          </button>
        </div>

        <div className="mb-6 flex flex-col space-y-2 md:hidden">
          <button
            onClick={() => setActiveSection('profile')}
            className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === 'profile'
                ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950 dark:text-indigo-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Profil-Sichtbarkeit
          </button>
          <button
            onClick={() => setActiveSection('messages')}
            className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === 'messages'
                ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950 dark:text-indigo-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Nachrichten-Privatsphäre
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === 'notifications'
                ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950 dark:text-indigo-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Forum-Benachrichtigungen
          </button>
        </div>
      </div>

      {activeSection === 'profile' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Privatsphäre-Einstellungen
            </h3>
            <button
              onClick={showPreview}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              disabled={isLoading}
            >
              <Eye className="mr-1 h-4 w-4" />
              Vorschau für andere
            </button>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <strong>Tipp:</strong> Dein Display Name ist immer sichtbar. Alle
            anderen Daten kannst du individuell freigeben.
          </div>

          <div className="space-y-4">
            {privacyFields.map((field) => (
              <div
                key={field.key}
                className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {field.label}
                      </h4>
                      {field.value && (
                        <span className="truncate text-sm text-gray-500 dark:text-gray-400">
                          (
                          {field.value.length > 20
                            ? field.value.substring(0, 20) + '...'
                            : field.value}
                          )
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {field.description}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      onPrivacyChange(field.key, !user[field.key as keyof User])
                    }
                    disabled={isLoading}
                    className={`flex flex-shrink-0 items-center rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
                      user[field.key as keyof User]
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                    }`}
                  >
                    {user[field.key as keyof User] ? (
                      <>
                        <EyeOff className="mr-1 h-4 w-4" />
                        Privat
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-4 w-4" />
                        Öffentlich
                      </>
                    )}
                  </button>
                </div>

                {!field.value && (
                  <div className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
                    Noch nicht ausgefüllt
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
              Zusammenfassung
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Öffentliche Felder:</span>
                <span className="font-medium">
                  {privacyFields.filter(
                    (f) => !user[f.key as keyof User] && f.value
                  ).length + 1}{' '}
                  / {privacyFields.length + 1}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Display Name ist immer öffentlich
              </div>
            </div>
          </div>
        </div>
      ) : activeSection === 'messages' ? (
        <MessagePrivacyControls
          onSettingsChange={handleMessageSettingsChange}
        />
      ) : (
        <NotificationPrivacyControls />
      )}
    </div>
  );
}
