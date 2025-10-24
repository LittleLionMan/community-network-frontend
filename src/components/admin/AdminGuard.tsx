'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/admin');
      return;
    }

    if (!isLoading && isAuthenticated && !user?.is_admin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Überprüfung der Admin-Berechtigung...
            </h2>
            <p className="mt-2 text-sm text-gray-500">Einen Moment bitte</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Anmeldung erforderlich
            </h2>
            <p className="mt-2 text-gray-600">
              Sie werden zur Anmeldung weitergeleitet...
            </p>
          </div>
        </div>
      )
    );
  }

  if (!user?.is_admin) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Zugriff verweigert
            </h2>
            <p className="mt-2 text-gray-600">
              Sie haben keine Administrator-Berechtigung.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Sie werden zur Startseite weitergeleitet...
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
