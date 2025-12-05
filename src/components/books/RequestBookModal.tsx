'use client';

import { useState } from 'react';
import {
  X,
  Calendar,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOffer } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useUserAvailability } from '@/hooks/useAvailability';
import { AvailabilityCalendar } from '@/components/availability/AvailabilityCalendar';
import { addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';

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
  const [selectedTimes, setSelectedTimes] = useState<Date[]>([]);
  const [showCalendar, setShowCalendar] = useState(true);

  const createTransaction = useCreateTransaction();

  const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
  const { data: providerAvailability, isLoading: loadingAvailability } =
    useUserAvailability(bookOffer.owner_id, undefined, endDate);

  const handleAddTime = (time: Date) => {
    if (selectedTimes.length >= 5) {
      toast.error(
        'Maximum erreicht',
        'Du kannst maximal 5 Zeiten vorschlagen.'
      );
      return;
    }
    if (!selectedTimes.find((t) => t.getTime() === time.getTime())) {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const handleRemoveTime = (index: number) => {
    setSelectedTimes(selectedTimes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Fehler', 'Bitte gib eine Nachricht ein.');
      return;
    }

    if (selectedTimes.length === 0) {
      toast.error(
        'Fehler',
        'Bitte wähle mindestens einen Terminvorschlag aus.'
      );
      return;
    }

    try {
      const proposedTimesISO = selectedTimes.map((t) => t.toISOString());

      await createTransaction.mutateAsync({
        providerId: bookOffer.owner_id,
        data: {
          offer_type: 'book_offer',
          offer_id: bookOffer.id,
          transaction_type: 'book_exchange',
          initial_message: message,
          proposed_times: proposedTimesISO,
        },
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
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
              placeholder="Hallo! Ich würde gerne dein Buch erwerben..."
              rows={4}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {message.length}/2000 Zeichen
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Terminvorschläge *{' '}
                <span className="text-xs text-gray-500">
                  (mind. 1 erforderlich)
                </span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                disabled={loadingAvailability}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {showCalendar
                  ? 'Kalender ausblenden'
                  : 'Verfügbarkeit anzeigen'}
              </Button>
            </div>

            {showCalendar && (
              <div className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                {loadingAvailability ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {providerAvailability && providerAvailability.length > 0 ? (
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        Verfügbarkeit von {bookOffer.owner?.display_name}:
                      </p>
                    ) : (
                      <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
                        <AlertCircle className="mb-1 mr-1 inline h-4 w-4" />
                        Der Anbieter hat noch keine Verfügbarkeiten festgelegt.
                        Du kannst trotzdem beliebige Zeiten vorschlagen.
                      </p>
                    )}
                    <AvailabilityCalendar
                      slots={providerAvailability || []}
                      onSelectTime={handleAddTime}
                      selectedTimes={selectedTimes}
                      mode="select"
                      minDate={new Date()}
                    />
                  </>
                )}
              </div>
            )}

            {selectedTimes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Ausgewählte Zeiten ({selectedTimes.length}/5):
                </p>
                {selectedTimes.map((time, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-900 dark:text-green-200">
                        {format(time, 'EEEE, dd.MM.yyyy HH:mm', {
                          locale: de,
                        })}{' '}
                        Uhr
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTime(idx)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedTimes.length === 0 && !showCalendar && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="mr-1 inline h-4 w-4" />
                Bitte wähle mindestens einen Termin aus.
              </p>
            )}

            {selectedTimes.length < 5 && selectedTimes.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Du kannst noch {5 - selectedTimes.length} weitere Zeiten
                vorschlagen.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createTransaction.isPending}
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !message.trim() ||
              selectedTimes.length === 0 ||
              createTransaction.isPending
            }
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            {createTransaction.isPending ? (
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
