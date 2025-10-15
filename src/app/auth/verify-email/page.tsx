'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';

function VerifyEmailContent() {
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('E-Mail-Adresse nicht gefunden');
      return;
    }

    setIsResending(true);
    try {
      await apiClient.auth.resendVerification({ email });
      toast.success('Bestätigungsmail wurde erneut gesendet');
    } catch (error) {
      toast.error('Fehler beim Versenden der E-Mail');
      console.log(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-community-50">
            <Mail className="h-8 w-8 text-community-600" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            E-Mail bestätigen
          </h1>
          <div className="mb-8 space-y-4 text-gray-600">
            <p>
              Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet.
            </p>
            {email && (
              <p className="break-all text-sm font-medium text-gray-800">
                {email}
              </p>
            )}
            <p>
              Bitte klicken Sie auf den Link in der E-Mail, um Ihren Account zu
              aktivieren.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p>Keine E-Mail erhalten?</p>
              <p>Prüfen Sie auch Ihren Spam-Ordner.</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isResending || !email}
            >
              {isResending ? 'Wird gesendet...' : 'E-Mail erneut senden'}
            </Button>
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zur Anmeldung
              </Button>
            </Link>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500">
              Bei Problemen kontaktieren Sie unseren{' '}
              <Link
                href="/support"
                className="text-community-600 hover:text-community-500"
              >
                Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-community-600"></div>
              <p className="mt-4 text-gray-600">Wird geladen...</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
