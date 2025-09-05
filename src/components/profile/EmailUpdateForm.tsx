'use client';

import { useState } from 'react';
import { Mail, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface EmailUpdateFormProps {
  currentEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmailUpdateForm({
  currentEmail,
  onSuccess,
  onCancel,
}: EmailUpdateFormProps) {
  const [formData, setFormData] = useState({
    new_email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<typeof formData> = {};

    if (!formData.new_email) {
      newErrors.new_email = 'Neue Email ist erforderlich';
    } else if (!formData.new_email.includes('@')) {
      newErrors.new_email = 'Ungültige Email-Adresse';
    } else if (formData.new_email === currentEmail) {
      newErrors.new_email =
        'Neue Email muss sich von der aktuellen unterscheiden';
    }

    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiClient.auth.updateEmail(formData);
      onSuccess();
    } catch (error) {
      console.error('Email update error:', error);

      if (error instanceof Error) {
        const message = error.message;

        if (message.includes('HTTP 400')) {
          setErrors({ password: 'Das eingegebene Passwort ist falsch' });
          return;
        }

        if (message.includes('HTTP 409')) {
          setErrors({ new_email: 'Diese Email-Adresse ist bereits vergeben' });
          return;
        }

        if (message.includes('HTTP 422')) {
          setErrors({ new_email: 'Ungültige Email-Adresse' });
          return;
        }

        if (message.includes('HTTP 401')) {
          setErrors({
            password:
              'Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.',
          });
          return;
        }

        if (message.includes('HTTP 429')) {
          setErrors({ new_email: 'Zu viele Versuche. Bitte warten Sie.' });
          return;
        }

        if (message.includes('HTTP 500')) {
          setErrors({
            new_email: 'Server-Fehler. Versuchen Sie es später erneut.',
          });
          return;
        }

        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes('password') &&
          lowerMessage.includes('incorrect')
        ) {
          setErrors({ password: 'Das eingegebene Passwort ist falsch' });
          return;
        }

        if (
          lowerMessage.includes('email') &&
          lowerMessage.includes('already')
        ) {
          setErrors({ new_email: 'Diese Email-Adresse ist bereits vergeben' });
          return;
        }

        if (
          lowerMessage.includes('invalid') &&
          lowerMessage.includes('format')
        ) {
          setErrors({ new_email: 'Ungültige Email-Adresse' });
          return;
        }
      }

      setErrors({
        new_email: 'Email-Update fehlgeschlagen. Überprüfen Sie Ihre Eingaben.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center">
          <Mail className="mr-2 h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Email-Adresse ändern
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Aktuelle Email
            </label>
            <input
              type="email"
              value={currentEmail}
              disabled
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Neue Email-Adresse *
            </label>
            <input
              type="email"
              value={formData.new_email}
              onChange={(e) => handleChange('new_email', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.new_email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="neue@email.de"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.new_email && (
              <p className="mt-1 text-sm text-red-600">{errors.new_email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Aktuelles Passwort *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ihr aktuelles Passwort"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <strong>Hinweis:</strong> Nach der Änderung müssen Sie Ihre neue
            Email-Adresse bestätigen.
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.new_email || !formData.password}
              className="flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Email ändern
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
