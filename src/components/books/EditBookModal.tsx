'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOffer } from '@/lib/api';
import { useUpdateOffer } from '@/hooks/useBooks';
import { toast } from '@/components/ui/toast';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: BookOffer;
  onSuccess?: () => void;
}

export function EditBookModal({
  isOpen,
  onClose,
  offer,
  onSuccess,
}: EditBookModalProps) {
  const updateOffer = useUpdateOffer();

  const [formData, setFormData] = useState({
    condition: offer.condition,
    notes: offer.notes || '',
    user_comment: offer.user_comment || '',
    custom_location: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        condition: offer.condition,
        notes: offer.notes || '',
        user_comment: offer.user_comment || '',
        custom_location: '',
      });
    }
  }, [isOpen, offer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateOffer.mutateAsync({
        offerId: offer.id,
        data: {
          condition: formData.condition,
          notes: formData.notes || undefined,
          user_comment: formData.user_comment || undefined,
          custom_location: formData.custom_location || undefined,
        },
      });

      toast.success(
        'Angebot aktualisiert',
        'Dein Angebot wurde erfolgreich bearbeitet.'
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        'Fehler',
        error instanceof Error
          ? error.message
          : 'Angebot konnte nicht aktualisiert werden.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Angebot bearbeiten
        </h2>

        <div className="mb-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {offer.book?.title}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {offer.book?.authors.join(', ')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zustand *
            </label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as
                    | 'new'
                    | 'like_new'
                    | 'good'
                    | 'acceptable',
                })
              }
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="new">Neu</option>
              <option value="like_new">Wie neu</option>
              <option value="good">Gut</option>
              <option value="acceptable">Akzeptabel</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notizen (optional)
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Interne Notizen (nicht öffentlich sichtbar)"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Öffentlicher Kommentar (optional)
            </label>
            <Textarea
              value={formData.user_comment}
              onChange={(e) =>
                setFormData({ ...formData, user_comment: e.target.value })
              }
              placeholder="Deine Rezension oder Meinung zum Buch"
              rows={4}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Abweichender Standort (optional)
            </label>
            <Input
              value={formData.custom_location}
              onChange={(e) =>
                setFormData({ ...formData, custom_location: e.target.value })
              }
              placeholder="z.B. Mitte-Nord, Prenzlauer Berg"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Aktuell: {offer.location_district || 'Nicht gesetzt'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updateOffer.isPending}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={updateOffer.isPending}
            >
              {updateOffer.isPending ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
