'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { loginSchema, type LoginFormData } from '@/lib/auth-schemas';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import type { User } from '@/types';

interface LoginFormProps {
  redirectTo?: string;
  className?: string;
}

export function LoginForm({ redirectTo, className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const handleResendVerification = async () => {
    if (!userEmail) return;

    setIsResending(true);
    try {
      await apiClient.auth.resendVerification({ email: userEmail });
      toast.success('Bestätigungsmail wurde erneut gesendet');
      setShowResendButton(false);
    } catch (error) {
      toast.error('Fehler beim Versenden der E-Mail');
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setShowResendButton(false);
    clearErrors('root');

    try {
      const response = await apiClient.auth.login({
        email: data.email,
        password: data.password,
      });

      apiClient.setToken(response.access_token);
      const userResponse = (await apiClient.auth.me()) as User;
      login(userResponse);
      toast.success('Login erfolgreich');

      const destination = redirectTo || '/';
      router.push(destination);
    } catch (error: unknown) {
      console.error('Login error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('422')) {
        setError('root', {
          type: 'manual',
          message: 'E-Mail noch nicht bestätigt - prüfen Sie Ihr Postfach',
        });
        setUserEmail(data.email);
        setShowResendButton(true);
      } else if (errorMessage.includes('401')) {
        setError('root', {
          type: 'manual',
          message: 'E-Mail oder Passwort falsch',
        });
      } else if (errorMessage.includes('429')) {
        setError('root', {
          type: 'manual',
          message: 'Zu viele Versuche - versuchen Sie es später erneut',
        });
      } else if (errorMessage.includes('403')) {
        setError('root', {
          type: 'manual',
          message: 'Account deaktiviert - kontaktieren Sie den Support',
        });
      } else {
        toast.error('Network error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Anmelden</h1>
        <p className="text-gray-600">
          Willkommen zurück! Melden Sie sich in Ihrem Account an.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          label="E-Mail-Adresse"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            placeholder="ihre@email.de"
            disabled={isSubmitting}
            {...register('email')}
          />
        </FormField>

        <FormField label="Passwort" required error={errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Ihr Passwort"
              disabled={isSubmitting}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={togglePasswordVisibility}
              disabled={isSubmitting}
              aria-label={
                showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-community-600 focus:ring-community-500"
              disabled={isSubmitting}
              {...register('rememberMe')}
            />
            <span className="ml-2 text-sm text-gray-600">
              Angemeldet bleiben
            </span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-sm text-community-600 hover:text-community-500 focus:underline focus:outline-none"
          >
            Passwort vergessen?
          </Link>
        </div>

        {errors.root && (
          <div className="rounded-md bg-red-50 p-3">
            <div className="text-center text-sm text-red-600">
              {errors.root.message}
            </div>
            {showResendButton && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="text-sm text-blue-600 underline hover:text-blue-500 disabled:opacity-50"
                >
                  {isResending ? 'Wird gesendet...' : 'E-Mail erneut senden'}
                </button>
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird angemeldet...
            </>
          ) : (
            'Anmelden'
          )}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Noch kein Account?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-community-600 hover:text-community-500 focus:underline focus:outline-none"
            >
              Jetzt registrieren
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
