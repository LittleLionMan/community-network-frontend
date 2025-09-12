'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCreateForm } from '@/components/events/EventCreateForm';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/events/create');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const handleCancel = () => {
    router.push('/events');
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
          <Link href="/events" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Events
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-community-100">
              <Plus className="h-6 w-6 text-community-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Neues Event erstellen
            </h1>
            <p className="mt-2 text-gray-600">
              Organisiere ein Event für deine Community. Fülle alle wichtigen
              Informationen aus, damit andere Nutzer wissen, was sie erwartet.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <EventCreateForm
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
                    Tipps für erfolgreiche Events
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Wähle einen aussagekräftigen Titel</li>
                    <li>• Beschreibe klar, was Teilnehmer erwartet</li>
                    <li>• Gib eine genaue Ortsangabe an</li>
                    <li>• Plane genügend Zeit ein</li>
                    <li>• Limitiere Teilnehmer bei Bedarf</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">
                Event Richtlinien
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
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <strong>Hinweis:</strong> Nach dem Erstellen kannst du dein
                Event jederzeit bearbeiten oder löschen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
