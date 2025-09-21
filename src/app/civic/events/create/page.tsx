'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Info, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CivicEventCreateForm } from '@/components/civic/CivicEventCreateForm';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

export default function CreateCivicEventPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/civic/events/create');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = (eventId: number) => {
    router.push(`/civic/events/${eventId}`);
  };

  const handleCancel = () => {
    router.push('/civic/events');
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
          <Link href="/civic/events" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu politischen Events
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Megaphone className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Politisches Event erstellen
            </h1>
            <p className="mt-2 text-gray-600">
              Organisiere ein Event mit politischem oder gesellschaftlichem
              Fokus. Diskussionsrunden, Aufklärungsveranstaltungen oder
              Community-Initiativen.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <CivicEventCreateForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <h3 className="mb-2 font-medium text-blue-900">
                    Tipps für politische Events
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Wähle einen neutralen, informativen Titel</li>
                    <li>• Erkläre das politische Thema klar</li>
                    <li>• Plane genug Zeit für Diskussionen ein</li>
                    <li>• Wähle einen zugänglichen Ort</li>
                    <li>• Beachte rechtliche Bestimmungen</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                <div>
                  <h3 className="mb-2 font-medium text-orange-900">
                    Politische Event-Arten
                  </h3>
                  <ul className="space-y-1 text-sm text-orange-800">
                    <li>• Diskussionsrunden</li>
                    <li>• Aufklärungsveranstaltungen</li>
                    <li>• Bürgersprechstunden</li>
                    <li>• Demonstrationen*</li>
                    <li>• Community-Initiativen</li>
                    <li>• Politische Bildung</li>
                  </ul>
                  <p className="mt-2 text-xs text-orange-700">
                    *Demos müssen separat angemeldet werden
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">
                Politische Event Richtlinien
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Titel:</span>
                  <span>Max. 200 Zeichen</span>
                </div>
                <div className="flex justify-between">
                  <span>Beschreibung:</span>
                  <span>10-2000 Zeichen</span>
                </div>
                <div className="flex justify-between">
                  <span>Teilnehmer:</span>
                  <span>Max. 1000 Personen</span>
                </div>
                <div className="flex justify-between">
                  <span>Vorlaufzeit:</span>
                  <span>Mind. 1 Tag</span>
                </div>
                <div className="flex justify-between">
                  <span>Kategorie:</span>
                  <span>Automatisch Politik</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Wichtig:</strong> Politische Events müssen sachlich,
                respektvoll und demokratisch sein. Hassrede oder Extremismus
                sind nicht gestattet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
