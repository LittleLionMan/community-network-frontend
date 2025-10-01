'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import {
  registerStep1Schema,
  registerStep2Schema,
  passwordCriteria,
  type RegisterStep1Data,
  type RegisterStep2Data,
  type RegisterFormData,
} from '@/lib/auth-schemas';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';

interface RegisterFormProps {
  className?: string;
}

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export function RegisterForm({ className }: RegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step1Data, setStep1Data] = useState<RegisterStep1Data | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');

  const [emailStatus, setEmailStatus] = useState<AvailabilityStatus>('idle');
  const [displayNameStatus, setDisplayNameStatus] =
    useState<AvailabilityStatus>('idle');

  const router = useRouter();

  const step1Form = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
  });

  const step2Form = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
  });

  const checkAvailability = useCallback(
    async (field: 'email' | 'displayName', value: string) => {
      if (!value || value.length < 2) return;

      const setStatus =
        field === 'email' ? setEmailStatus : setDisplayNameStatus;
      setStatus('checking');

      try {
        const checkData =
          field === 'email' ? { email: value } : { display_name: value };

        const result = await apiClient.auth.checkAvailability(checkData);
        setStatus(result.available ? 'available' : 'taken');

        if (!result.available) {
          const message =
            field === 'email'
              ? 'E-Mail-Adresse bereits vergeben'
              : 'Display Name bereits vergeben';
          step1Form.setError(field, { type: 'manual', message });
        } else {
          step1Form.clearErrors(field);
        }
      } catch (error) {
        setStatus('error');
        console.error('Availability check failed:', error);
      }
    },
    [step1Form]
  );

  const useDebounce = <T extends unknown[]>(
    callback: (...args: T) => void,
    delay: number
  ) => {
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
      null
    );

    return useCallback(
      (...args: T) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        setDebounceTimer(setTimeout(() => callback(...args), delay));
      },
      [callback, delay, debounceTimer]
    );
  };

  const debouncedEmailCheck = useDebounce(
    (value: string) => checkAvailability('email', value),
    500
  );
  const debouncedDisplayNameCheck = useDebounce(
    (value: string) => checkAvailability('displayName', value),
    500
  );

  const onStep1Submit = async (data: RegisterStep1Data) => {
    setIsSubmitting(true);

    try {
      const emailCheck = apiClient.auth.checkAvailability({
        email: data.email,
      });
      const displayNameCheck = apiClient.auth.checkAvailability({
        display_name: data.displayName,
      });

      const [emailResult, displayNameResult] = await Promise.all([
        emailCheck,
        displayNameCheck,
      ]);

      if (!emailResult.available) {
        step1Form.setError('email', {
          type: 'manual',
          message: 'E-Mail-Adresse bereits vergeben',
        });
        setEmailStatus('taken');
        return;
      }

      if (!displayNameResult.available) {
        step1Form.setError('displayName', {
          type: 'manual',
          message: 'Display Name bereits vergeben',
        });
        setDisplayNameStatus('taken');
        return;
      }

      setStep1Data(data);
      setCurrentStep(2);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('email')) {
        step1Form.setError('email', {
          type: 'manual',
          message: 'E-Mail bereits vergeben',
        });
        setEmailStatus('taken');
      } else if (errorMessage.includes('display_name')) {
        step1Form.setError('displayName', {
          type: 'manual',
          message: 'Display Name bereits vergeben',
        });
        setDisplayNameStatus('taken');
      } else {
        toast.error('Network error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onStep2Submit = async (data: RegisterStep2Data) => {
    if (!step1Data) return;

    setIsSubmitting(true);
    try {
      const fullData: RegisterFormData = { ...step1Data, ...data };
      const backendData = {
        display_name: fullData.displayName,
        email: fullData.email,
        password: fullData.password,
        first_name: fullData.firstName,
        last_name: fullData.lastName,
      };

      await apiClient.auth.register(backendData);
      toast.success('Registrierung erfolgreich');
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(fullData.email)}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('email')) {
        toast.error('Registrierung fehlgeschlagen. Email bereits angemeldet');
        setCurrentStep(1);
      } else {
        toast.error('Registrierung fehlgeschlagen');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const AvailabilityIndicator = ({
    status,
  }: {
    status: AvailabilityStatus;
    field: string;
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

  const isPasswordValid = (password: string): boolean => {
    return passwordCriteria.every((criterion) => criterion.test(password));
  };

  return (
    <div className={className}>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Account erstellen
        </h1>
        <p className="text-gray-600">Werden Sie Teil unserer Community</p>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-community-600">
            Schritt {currentStep} von 2
          </span>
          <span className="text-xs text-gray-500">
            {currentStep === 1 ? 'Grunddaten' : 'Passwort & Details'}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-community-600 transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          />
        </div>
      </div>

      {currentStep === 1 ? (
        <form
          onSubmit={step1Form.handleSubmit(onStep1Submit)}
          className="space-y-6"
          noValidate
        >
          <FormField
            label="Display Name"
            required
            error={step1Form.formState.errors.displayName?.message}
            success={
              displayNameStatus === 'available' ? 'Verfügbar' : undefined
            }
          >
            <div className="relative">
              <Input
                type="text"
                autoComplete="username"
                placeholder="IhrDisplayName"
                disabled={isSubmitting}
                className="pr-10"
                {...step1Form.register('displayName', {
                  onBlur: (e) => {
                    if (e.target.value && e.target.value.length >= 2) {
                      debouncedDisplayNameCheck(e.target.value);
                    }
                  },
                  onChange: () => {
                    if (displayNameStatus !== 'idle') {
                      setDisplayNameStatus('idle');
                    }
                  },
                })}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <AvailabilityIndicator
                  status={displayNameStatus}
                  field="displayName"
                />
              </div>
            </div>
          </FormField>

          <FormField
            label="E-Mail-Adresse"
            required
            error={step1Form.formState.errors.email?.message}
            success={emailStatus === 'available' ? 'Verfügbar' : undefined}
          >
            <div className="relative">
              <Input
                type="email"
                autoComplete="email"
                placeholder="ihre@email.de"
                disabled={isSubmitting}
                className="pr-10"
                {...step1Form.register('email', {
                  onBlur: (e) => {
                    if (e.target.value && e.target.value.includes('@')) {
                      debouncedEmailCheck(e.target.value);
                    }
                  },
                  onChange: () => {
                    if (emailStatus !== 'idle') {
                      setEmailStatus('idle');
                    }
                  },
                })}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <AvailabilityIndicator status={emailStatus} field="email" />
              </div>
            </div>
          </FormField>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting ||
              (emailStatus !== 'idle' && emailStatus !== 'available') ||
              (displayNameStatus !== 'idle' &&
                displayNameStatus !== 'available')
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Überprüfung läuft...
              </>
            ) : (
              'Weiter'
            )}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Bereits ein Account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-community-600 hover:text-community-500"
              >
                Jetzt anmelden
              </Link>
            </span>
          </div>
        </form>
      ) : (
        <form
          onSubmit={step2Form.handleSubmit(onStep2Submit)}
          className="space-y-6"
          noValidate
        >
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Zurück zu Schritt 1
          </button>

          <div className="mb-4 flex items-center rounded bg-green-50 p-3 text-sm text-gray-600">
            <Check className="mr-2 h-4 w-4 text-green-600" />
            <span>
              {step1Data?.displayName} • {step1Data?.email}
            </span>
          </div>

          <FormField
            label="Passwort"
            required
            error={step2Form.formState.errors.password?.message}
          >
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ihr Passwort"
                  disabled={isSubmitting}
                  className="pr-10"
                  {...step2Form.register('password', {
                    onChange: (e) => setCurrentPassword(e.target.value),
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <PasswordStrength password={currentPassword} />
            </div>
          </FormField>

          <FormField
            label="Passwort bestätigen"
            required
            error={step2Form.formState.errors.confirmPassword?.message}
          >
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Passwort wiederholen"
                disabled={isSubmitting}
                className="pr-10"
                {...step2Form.register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vorname (optional)">
              <Input
                type="text"
                autoComplete="given-name"
                placeholder="Max"
                disabled={isSubmitting}
                {...step2Form.register('firstName')}
              />
            </FormField>

            <FormField label="Nachname (optional)">
              <Input
                type="text"
                autoComplete="family-name"
                placeholder="Mustermann"
                disabled={isSubmitting}
                {...step2Form.register('lastName')}
              />
            </FormField>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isPasswordValid(currentPassword)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Account wird erstellt...
              </>
            ) : (
              'Account erstellen'
            )}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Bereits ein Account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-community-600 hover:text-community-500"
              >
                Jetzt anmelden
              </Link>
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
