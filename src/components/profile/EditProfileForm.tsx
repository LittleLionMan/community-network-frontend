'use client';

import { useState, useCallback } from 'react';
import { Save, Loader2, Check, X, AlertCircle } from 'lucide-react';
import type { User } from '@/types';
import { apiClient } from '@/lib/api';
import { LocationInput } from '@/components/books/LocationInput';

interface ProfileFormData {
  display_name: string;
  first_name: string;
  last_name: string;
  bio: string;
  exact_address: string;
}

interface EditProfileFormProps {
  user: User;
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export function EditProfileForm({
  user,
  onSave,
  onCancel,
  isLoading,
}: EditProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: user.display_name || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    bio: user.bio || '',
    exact_address: user.exact_address || '',
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [isLocationValid, setIsLocationValid] = useState(true);
  const [locationDistrict, setLocationDistrict] = useState<
    string | undefined
  >();
  const [displayNameStatus, setDisplayNameStatus] =
    useState<AvailabilityStatus>('idle');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const checkDisplayNameAvailability = useCallback(
    async (displayName: string) => {
      if (
        !displayName ||
        displayName.length < 2 ||
        displayName === user.display_name
      ) {
        setDisplayNameStatus('idle');
        return;
      }

      setDisplayNameStatus('checking');

      try {
        const result = await apiClient.auth.checkAvailability({
          display_name: displayName,
        });
        setDisplayNameStatus(result.available ? 'available' : 'taken');

        if (!result.available) {
          setErrors((prev) => ({
            ...prev,
            display_name: 'Display Name bereits vergeben',
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            display_name: undefined,
          }));
        }
      } catch (error) {
        setDisplayNameStatus('error');
        setErrors((prev) => ({
          ...prev,
          display_name: 'Fehler bei der Überprüfung',
        }));
      }
    },
    [user.display_name]
  );

  const debouncedDisplayNameCheck = useCallback(
    (value: string) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      setDebounceTimer(
        setTimeout(() => checkDisplayNameAvailability(value), 500)
      );
    },
    [checkDisplayNameAvailability, debounceTimer]
  );

  const handleSubmit = async () => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.display_name || formData.display_name.length < 2) {
      newErrors.display_name = 'Display Name muss mindestens 2 Zeichen haben';
    }
    if (formData.display_name && formData.display_name.length > 20) {
      newErrors.display_name = 'Display Name darf maximal 20 Zeichen haben';
    }
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio darf maximal 1000 Zeichen haben';
    }

    if (
      formData.display_name !== user.display_name &&
      displayNameStatus === 'taken'
    ) {
      newErrors.display_name = 'Display Name bereits vergeben';
    }
    if (formData.exact_address && !isLocationValid) {
      newErrors.exact_address = 'Standort konnte nicht validiert werden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (
      formData.display_name !== user.display_name &&
      displayNameStatus !== 'available'
    ) {
      try {
        const result = await apiClient.auth.checkAvailability({
          display_name: formData.display_name,
        });
        if (!result.available) {
          setErrors({ display_name: 'Display Name bereits vergeben' });
          setDisplayNameStatus('taken');
          return;
        }
      } catch (error) {
        setErrors({ display_name: 'Fehler bei der Überprüfung' });
        return;
      }
    }

    await onSave(formData);
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === 'display_name') {
      if (value === user.display_name) {
        setDisplayNameStatus('idle');
      } else if (value.length >= 2) {
        debouncedDisplayNameCheck(value);
      } else {
        setDisplayNameStatus('idle');
      }
    }
  };

  const AvailabilityIndicator = ({
    status,
  }: {
    status: AvailabilityStatus;
  }) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
      case 'available':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'taken':
        return <X className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const canSubmit = () => {
    if (isLoading) return false;
    if (
      formData.display_name !== user.display_name &&
      displayNameStatus !== 'available'
    )
      return false;
    if (Object.keys(errors).some((key) => errors[key as keyof ProfileFormData]))
      return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Display Name *
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => handleChange('display_name', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.display_name ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={20}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AvailabilityIndicator status={displayNameStatus} />
          </div>
        </div>
        {errors.display_name && (
          <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
        )}
        {displayNameStatus === 'available' && (
          <p className="mt-1 text-sm text-green-600">Display Name verfügbar</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Wird immer öffentlich angezeigt ({formData.display_name.length}/20)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Vorname
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={100}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nachname
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={100}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={4}
          className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.bio ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={1000}
          placeholder="Erzähle anderen von deinen Interessen und warum du Teil der Community bist..."
          disabled={isLoading}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.bio.length}/1000 Zeichen
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Standort
        </label>
        <LocationInput
          value={formData.exact_address}
          onChange={(value) => handleChange('exact_address', value)}
          onValidated={(isValid, district) => {
            setIsLocationValid(isValid);
            setLocationDistrict(district);

            if (!isValid && formData.exact_address.length >= 3) {
              setErrors((prev) => ({
                ...prev,
                exact_address: 'Standort konnte nicht gefunden werden',
              }));
            } else {
              setErrors((prev) => ({
                ...prev,
                exact_address: undefined,
              }));
            }
          }}
          error={!!errors.exact_address}
          disabled={isLoading}
          placeholder="z.B. Musterstraße 1, 48143 Münster"
        />
        {errors.exact_address && (
          <p className="mt-1 text-sm text-red-600">{errors.exact_address}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Hilft bei lokalen Events und Services
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Speichern
        </button>

        <button
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
