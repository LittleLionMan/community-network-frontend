'use client';

import { useState } from 'react';
import { X, Calendar, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { apiClient } from '@/lib/api';
import { BookOffer } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface RequestBookModalProps {
  bookOffer: BookOffer;
  onClose: () => void;
}

export function RequestBookModal({
  bookOffer,
  onClose,
}: RequestBookModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [proposedTimes, setProposedTimes] = useState<(Date | undefined)[]>([
    undefined,
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddTime = () => {
    if (proposedTimes.length < 5) {
      setProposedTimes([...proposedTimes, undefined]);
    }
  };

  const handleTimeChange = (index: number, value: Date | null) => {
    const updated = [...proposedTimes];
    updated[index] = value || undefined;
    setProposedTimes(updated);
  };

  const handleRemoveTime = (index: number) => {
    setProposedTimes(proposedTimes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Fehler', 'Bitte gib eine Nachricht ein.');
      return;
    }

    setLoading(true);
    try {
      const validTimes = proposedTimes
        .filter((t): t is Date => t !== undefined)
        .map((t) => t.toISOString());

      await apiClient.transactions.create(bookOffer.owner_id, {
        offer_type: 'book_offer',
        offer_id: bookOffer.id,
        transaction_type: 'book_exchange',
        initial_message: message,
        proposed_times: validTimes,
      });

      toast.success(
        'Anfrage gesendet',
        'Deine Anfrage wurde an den Anbieter gesendet.'
      );

      router.push('/messages');
      onClose();
    } catch (error) {
      toast.error(
        'Fehler',
        error instanceof Error
          ? error.message
          : 'Anfrage konnte nicht gesendet werden.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {bookOffer.book?.title} anfragen
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Anbieter:{' '}
            <span className="font-medium">{bookOffer.owner?.display_name}</span>
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Standort:{' '}
            <span className="font-medium">
              {bookOffer.location_district || 'Nicht angegeben'}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deine Nachricht *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hallo! Ich würde gerne dein Buch ausleihen..."
              rows={4}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {message.length}/2000 Zeichen
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Terminvorschläge (optional)
            </label>
            <div className="space-y-2">
              {proposedTimes.map((time, idx) => (
                <div key={idx} className="flex gap-2">
                  <DateTimePicker
                    value={time}
                    onChange={(date) => handleTimeChange(idx, date)}
                    minDate={new Date()}
                  />
                  {proposedTimes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTime(idx)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {proposedTimes.length < 5 && (
              <button
                type="button"
                onClick={handleAddTime}
                className="mt-2 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                <Calendar className="h-4 w-4" />
                Weiteren Termin hinzufügen
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || loading}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sende...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Anfrage senden
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
