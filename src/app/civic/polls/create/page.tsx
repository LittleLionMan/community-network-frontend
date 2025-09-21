'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Vote, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PollCreateForm } from '@/components/civic/PollCreateForm';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

export default function CreatePollPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/civic/polls/create');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = (pollId: number) => {
    router.push(`/civic/polls/${pollId}`);
  };

  const handleCancel = () => {
    router.push('/civic/polls');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-community-200 border-t-community-600"></div>
            <p className="text-gray-600">Wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/civic/polls" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Abstimmungen
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Vote className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Neue Abstimmung erstellen
            </h1>
            <p className="mt-2 text-gray-600">
              Erstelle eine Abstimmung für deine Community. Nutzer können
              abstimmen und die Ergebnisse sind transparent einsehbar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <PollCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <h3 className="mb-2 font-medium text-blue-900">
                    Tipps für gute Abstimmungen
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Stelle eine klare, eindeutige Frage</li>
                    <li>• Formuliere neutrale Antwortoptionen</li>
                    <li>• Wähle eine angemessene Laufzeit</li>
                    <li>• Teile die Abstimmung in der Community</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">
                Abstimmungs-Richtlinien
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Frage:</span>
                  <span>Max. 500 Zeichen</span>
                </div>
                <div className="flex justify-between">
                  <span>Optionen:</span>
                  <span>2-10 Stück</span>
                </div>
                <div className="flex justify-between">
                  <span>Option:</span>
                  <span>Max. 200 Zeichen</span>
                </div>
                <div className="flex justify-between">
                  <span>Laufzeit:</span>
                  <span>Unbegrenzt oder bis zu 30 Tage</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <strong>Hinweis:</strong> Nach dem Erstellen können nur noch die
                Frage, das Enddatum und der Status bearbeitet werden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
