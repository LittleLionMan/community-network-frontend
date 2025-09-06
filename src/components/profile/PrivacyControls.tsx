'use client';

import { useState } from 'react';
import { Eye, EyeOff, MessageCircle, Users, Bell } from 'lucide-react';
import type { User } from '@/types';
import { useMessagePrivacy } from '@/hooks/useMessages';

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
  const { settings, isLoading, updateSettings } = useMessagePrivacy();

  const handleToggle = async (setting: string, value: boolean) => {
    try {
      await updateSettings({ [setting]: value });
      onSettingsChange({ [setting]: value });
    } catch (error) {
      console.error('Failed to update message privacy settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="h-3 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 flex items-center text-lg font-medium text-gray-900">
          <MessageCircle className="mr-2 h-5 w-5" />
          Nachrichten-Privatsphäre
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Bestimme, wer dir Nachrichten senden kann und wie du benachrichtigt
          wirst.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-start space-x-3">
            <MessageCircle className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                Nachrichten aktiviert
              </div>
              <div className="text-sm text-gray-600">
                Andere Community-Mitglieder können dir private Nachrichten
                senden
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.messages_enabled ?? true}
              onChange={(e) =>
                handleToggle('messages_enabled', e.target.checked)
              }
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300"></div>
          </label>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg p-4 transition-opacity ${
            settings.messages_enabled ? 'bg-gray-50' : 'bg-gray-100 opacity-50'
          }`}
        >
          <div className="flex items-start space-x-3">
            <Users className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                Nachrichten von Fremden
              </div>
              <div className="text-sm text-gray-600">
                Auch Personen, mit denen du noch nie geschrieben hast, können
                dir schreiben
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.messages_from_strangers ?? true}
              onChange={(e) =>
                handleToggle('messages_from_strangers', e.target.checked)
              }
              disabled={!settings.messages_enabled}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300"></div>
          </label>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg p-4 transition-opacity ${
            settings.messages_enabled ? 'bg-gray-50' : 'bg-gray-100 opacity-50'
          }`}
        >
          <div className="flex items-start space-x-3">
            <Bell className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                Nachrichten-Benachrichtigungen
              </div>
              <div className="text-sm text-gray-600">
                Erhalte Benachrichtigungen bei neuen Nachrichten
              </div>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.messages_notifications ?? true}
              onChange={(e) =>
                handleToggle('messages_notifications', e.target.checked)
              }
              disabled={!settings.messages_enabled}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300"></div>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start space-x-3">
          <MessageCircle className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <div className="mb-1 font-medium text-blue-900">
              Nachrichten-Tipp
            </div>
            <div className="text-sm text-blue-800">
              {settings.messages_enabled
                ? settings.messages_from_strangers
                  ? 'Du erhältst Nachrichten von allen Community-Mitgliedern. Du kannst jederzeit einzelne Personen blockieren.'
                  : 'Du erhältst nur Nachrichten von Personen, mit denen du bereits geschrieben hast.'
                : 'Nachrichten sind deaktiviert. Andere können dir keine privaten Nachrichten senden.'}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600">⚠️</div>
          <div>
            <div className="mb-1 font-medium text-yellow-900">
              Wichtiger Hinweis
            </div>
            <div className="text-sm text-yellow-800">
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
  const [activeSection, setActiveSection] = useState<'profile' | 'messages'>(
    'profile'
  );

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
      key: 'location_private',
      label: 'Standort',
      value: user.location,
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
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Privacy-Einstellungen
        </h2>
        <p className="mb-6 text-gray-600">
          Kontrolliere, welche Informationen andere sehen können und wer dir
          schreiben darf.
        </p>

        <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeSection === 'profile'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profil-Sichtbarkeit
          </button>
          <button
            onClick={() => setActiveSection('messages')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeSection === 'messages'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nachrichten-Privacy
          </button>
        </div>
      </div>

      {activeSection === 'profile' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Privacy-Einstellungen
            </h3>
            <button
              onClick={showPreview}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              disabled={isLoading}
            >
              <Eye className="mr-1 h-4 w-4" />
              Vorschau für andere
            </button>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <strong>Tipp:</strong> Dein Display Name ist immer sichtbar. Alle
            anderen Daten kannst du individuell freigeben.
          </div>

          <div className="space-y-4">
            {privacyFields.map((field) => (
              <div key={field.key} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center">
                      <h4 className="font-medium text-gray-900">
                        {field.label}
                      </h4>
                      {field.value && (
                        <span className="ml-2 text-sm text-gray-500">
                          (
                          {field.value.length > 30
                            ? field.value.substring(0, 30) + '...'
                            : field.value}
                          )
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>

                  <button
                    onClick={() =>
                      onPrivacyChange(field.key, !user[field.key as keyof User])
                    }
                    disabled={isLoading}
                    className={`ml-4 flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
                      user[field.key as keyof User]
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
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
                  <div className="mt-2 text-sm italic text-gray-500">
                    Noch nicht ausgefüllt
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium text-gray-900">
              Privacy-Zusammenfassung
            </h4>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Öffentliche Felder:</span>
                <span className="font-medium">
                  {privacyFields.filter(
                    (f) => !user[f.key as keyof User] && f.value
                  ).length + 1}{' '}
                  / {privacyFields.length + 1}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Display Name ist immer öffentlich
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MessagePrivacyControls
          onSettingsChange={handleMessageSettingsChange}
        />
      )}
    </div>
  );
}
