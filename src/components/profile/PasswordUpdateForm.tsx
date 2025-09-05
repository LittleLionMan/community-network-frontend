'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface PasswordUpdateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const passwordCriteria = [
  {
    key: 'length',
    label: 'Mindestens 8 Zeichen',
    test: (password: string) => password.length >= 8,
  },
  {
    key: 'number',
    label: 'Eine Zahl (0-9)',
    test: (password: string) => /\d/.test(password),
  },
  {
    key: 'uppercase',
    label: 'Ein Großbuchstabe (A-Z)',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    key: 'special',
    label: 'Ein Sonderzeichen (!@#$%...)',
    test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export function PasswordUpdateForm({
  onSuccess,
  onCancel,
}: PasswordUpdateFormProps) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isPasswordValid = (password: string): boolean => {
    return passwordCriteria.every((criterion) => criterion.test(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<typeof formData> = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Aktuelles Passwort ist erforderlich';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Neues Passwort ist erforderlich';
    } else if (!isPasswordValid(formData.new_password)) {
      newErrors.new_password = 'Passwort erfüllt nicht alle Anforderungen';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Passwort bestätigen ist erforderlich';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwörter stimmen nicht überein';
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password =
        'Neues Passwort muss sich vom aktuellen unterscheiden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiClient.auth.updatePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      onSuccess();
    } catch (error) {
      console.error('Password update error:', error);

      let errorMessage = 'Passwort-Update fehlgeschlagen';
      if (error instanceof Error) {
        if (
          error.message.includes('current password') ||
          error.message.includes('incorrect')
        ) {
          setErrors({ current_password: 'Aktuelles Passwort ist falsch' });
          return;
        } else if (error.message.includes('400')) {
          setErrors({ current_password: 'Aktuelles Passwort ist falsch' });
          return;
        } else if (error.message.includes('429')) {
          errorMessage = 'Zu viele Versuche. Bitte warten Sie eine Stunde.';
        }
      }

      setErrors({ new_password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (
      field === 'new_password' &&
      formData.confirm_password &&
      value === formData.confirm_password
    ) {
      setErrors((prev) => ({ ...prev, confirm_password: undefined }));
    }
    if (
      field === 'confirm_password' &&
      formData.new_password &&
      value === formData.new_password
    ) {
      setErrors((prev) => ({ ...prev, confirm_password: undefined }));
    }
  };

  const PasswordStrength = ({ password }: { password: string }) => {
    return (
      <div className="mt-2 space-y-1">
        <p className="mb-2 text-xs text-gray-600">Passwort muss enthalten:</p>
        {passwordCriteria.map((criterion) => {
          const isValid = criterion.test(password);
          return (
            <div
              key={criterion.key}
              className={`flex items-center gap-2 text-xs transition-colors ${
                isValid ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {isValid ? (
                <Check className="h-3 w-3 flex-shrink-0" />
              ) : (
                <X className="h-3 w-3 flex-shrink-0" />
              )}
              <span>{criterion.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const canSubmit = () => {
    return (
      !isLoading &&
      formData.current_password &&
      isPasswordValid(formData.new_password) &&
      formData.new_password === formData.confirm_password &&
      formData.current_password !== formData.new_password
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Passwort ändern</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Aktuelles Passwort *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.current_password}
                onChange={(e) =>
                  handlePasswordChange('current_password', e.target.value)
                }
                className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.current_password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ihr aktuelles Passwort"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.current_password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.current_password}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Neues Passwort *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) =>
                  handlePasswordChange('new_password', e.target.value)
                }
                className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.new_password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ihr neues Passwort"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
            )}
            <PasswordStrength password={formData.new_password} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Neues Passwort bestätigen *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) =>
                  handlePasswordChange('confirm_password', e.target.value)
                }
                className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Neues Passwort wiederholen"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirm_password}
              </p>
            )}
            {formData.confirm_password &&
              formData.new_password === formData.confirm_password && (
                <p className="mt-1 flex items-center text-sm text-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Passwörter stimmen überein
                </p>
              )}
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Sicherheitshinweis:</strong> Nach der Passwort-Änderung
            werden Sie auf allen anderen Geräten automatisch abgemeldet.
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={!canSubmit()}
              className="flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Passwort ändern
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
