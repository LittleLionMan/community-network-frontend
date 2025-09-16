'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Info, HandHeart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceCreateForm } from '@/components/services/ServiceCreateForm';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

export default function CreateServicePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/services/create');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = (serviceId: number) => {
    router.push(`/services/${serviceId}`);
  };

  const handleCancel = () => {
    router.push('/services');
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
          <Link href="/services" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Services
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
              Neuen Service erstellen
            </h1>
            <p className="mt-2 text-gray-600">
              Biete einen Service an oder suche nach Hilfe in deiner Community.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <ServiceCreateForm
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
                    Tipps für erfolgreiche Services
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Sei ehrlich und detailliert</li>
                    <li>• Verwende aussagekräftige Bilder</li>
                    <li>• Gib klare Preisvorstellungen an</li>
                    <li>• Antworte schnell auf Anfragen</li>
                    <li>• Halte Vereinbarungen ein</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">Service Arten</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <HandHeart className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Service anbieten
                    </h4>
                    <p className="text-sm text-gray-600">
                      Du hilfst anderen mit deinen Fähigkeiten
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Service suchen
                    </h4>
                    <p className="text-sm text-gray-600">
                      Du brauchst Hilfe und suchst jemanden
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-medium text-gray-900">
                Service Richtlinien
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Titel:</span>
                  <span>Max. 100 Zeichen</span>
                </div>
                <div className="flex justify-between">
                  <span>Beschreibung:</span>
                  <span>10-2000 Zeichen</span>
                </div>
                <div className="flex justify-between">
                  <span>Bild:</span>
                  <span>Max. 5MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Treffpunkte:</span>
                  <span>Max. 5 Orte</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800">
                <strong>Tipp:</strong> Services mit Bildern und detaillierten
                Beschreibungen erhalten 3x mehr Anfragen!
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <strong>Hinweis:</strong> Nach dem Erstellen kannst du deinen
                Service jederzeit bearbeiten oder löschen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
