'use client';

import { Eye, EyeOff } from 'lucide-react';
import type { User } from '@/types';

interface PrivacyControlsProps {
  user: User;
  onPrivacyChange: (field: string, value: boolean) => void;
  showPreview: () => void;
  isLoading?: boolean;
}

export function PrivacyControls({
  user,
  onPrivacyChange,
  showPreview,
  isLoading,
}: PrivacyControlsProps) {
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
                  <h4 className="font-medium text-gray-900">{field.label}</h4>
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
  );
}
