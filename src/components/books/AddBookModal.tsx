'use client';

import { useState, useEffect } from 'react';
import { Loader2, BookOpen, AlertCircle, Check, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LocationInput } from '@/components/books/LocationInput';
import { ISBNScanner } from '@/components/books/ISBNScanner';
import { useBookSearch, useCreateOffer } from '@/hooks/useBooks';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import { getBookCoverUrl } from '@/lib/book-utils';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBookModal({
  isOpen,
  onClose,
  onSuccess,
}: AddBookModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'isbn' | 'details'>('isbn');
  const [isbn, setIsbn] = useState('');
  const [isIsbnValid, setIsIsbnValid] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [condition, setCondition] = useState<
    'new' | 'like_new' | 'good' | 'acceptable'
  >('good');
  const [userComment, setUserComment] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [locationDistrict, setLocationDistrict] = useState<
    string | undefined
  >();

  const { data: book, isLoading: isSearching } = useBookSearch(
    isbn,
    isIsbnValid && isbn.length >= 10
  );
  const createOffer = useCreateOffer();

  const userHasLocation = Boolean(user?.location);

  useEffect(() => {
    const cleaned = isbn.replace(/[^0-9X]/gi, '').toUpperCase();
    setIsbn(cleaned);
    setIsIsbnValid(cleaned.length === 10 || cleaned.length === 13);
  }, [isbn]);

  useEffect(() => {
    if (book) {
      setStep('details');
    }
  }, [book]);

  const handleReset = () => {
    setStep('isbn');
    setIsbn('');
    setCondition('good');
    setUserComment('');
    setCustomLocation('');
    setIsLocationValid(false);
    setLocationDistrict(undefined);
  };

  const handleSubmit = async () => {
    if (!book) return;

    if (!userHasLocation && !customLocation) {
      toast.error(
        'Standort fehlt',
        'Du musst entweder einen Standort in deinem Profil haben oder einen Custom Location angeben.'
      );
      return;
    }

    if (customLocation && !isLocationValid) {
      toast.error(
        'Ungültiger Standort',
        'Bitte gib einen gültigen Standort an.'
      );
      return;
    }

    try {
      await createOffer.mutateAsync({
        isbn: book.isbn_13,
        condition,
        notes: undefined,
        user_comment: userComment || undefined,
        custom_location: customLocation || undefined,
        location_district: locationDistrict || undefined,
      });

      toast.success(
        'Angebot erstellt!',
        'Dein Buch wurde erfolgreich angeboten.'
      );

      handleReset();
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Angebot konnte nicht erstellt werden.';
      toast.error('Fehler', errorMessage);
    }
  };

  const conditionOptions = [
    { value: 'new', label: 'Neu', description: 'Unbenutzt, originalverpackt' },
    {
      value: 'like_new',
      label: 'Wie neu',
      description: 'Kaum Gebrauchsspuren',
    },
    { value: 'good', label: 'Gut', description: 'Normale Gebrauchsspuren' },
    {
      value: 'acceptable',
      label: 'Akzeptabel',
      description: 'Deutliche Gebrauchsspuren',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            Buch anbieten
          </DialogTitle>
          <DialogDescription>
            {step === 'isbn'
              ? 'Gib die ISBN deines Buches ein'
              : 'Füge Details zu deinem Angebot hinzu'}
          </DialogDescription>
        </DialogHeader>

        {step === 'isbn' && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                ISBN (10 oder 13 Ziffern)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="z.B. 9783446246249"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  error={isbn.length > 0 && !isIsbnValid}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="shrink-0"
                  title="ISBN scannen"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              {isbn.length > 0 && !isIsbnValid && (
                <p className="mt-1 text-sm text-red-600">
                  ISBN muss 10 oder 13 Ziffern haben
                </p>
              )}
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            )}

            {!isSearching && book && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex gap-4">
                  {getBookCoverUrl(book.cover_image_url) ? (
                    <img
                      src={getBookCoverUrl(book.cover_image_url)!}
                      alt={book.title}
                      className="h-32 w-24 rounded object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-32 w-24 items-center justify-center rounded bg-gradient-to-br from-amber-100 to-amber-200 shadow-md">
                      <BookOpen className="h-12 w-12 text-amber-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                      {book.title}
                    </h3>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {book.authors.join(', ')}
                    </p>
                    {book.published_date && (
                      <p className="text-xs text-gray-500">
                        {book.published_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isSearching && isIsbnValid && !book && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Kein Buch mit dieser ISBN gefunden. Bitte überprüfe die
                  Eingabe.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'details' && book && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex gap-4">
                {getBookCoverUrl(book.cover_image_url) ? (
                  <img
                    src={getBookCoverUrl(book.cover_image_url)!}
                    alt={book.title}
                    className="h-24 w-16 rounded object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-24 w-16 items-center justify-center rounded bg-gradient-to-br from-amber-100 to-amber-200 shadow-md">
                    <BookOpen className="h-8 w-8 text-amber-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {book.authors.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Zustand *
              </label>
              <div className="space-y-2">
                {conditionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      condition === option.value
                        ? 'border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={option.value}
                      checked={condition === option.value}
                      onChange={(e) =>
                        setCondition(
                          e.target.value as
                            | 'new'
                            | 'like_new'
                            | 'good'
                            | 'acceptable'
                        )
                      }
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dein Kommentar (optional, max. 5000 Zeichen)
              </label>
              <Textarea
                placeholder="z.B. 'Tolles Buch über...', 'Hat mir sehr gefallen weil...'"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value.slice(0, 5000))}
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                {userComment.length}/5000 Zeichen
              </p>
            </div>

            {!userHasLocation && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Standort *
                </label>
                <LocationInput
                  value={customLocation}
                  onChange={setCustomLocation}
                  onValidated={(valid, district) => {
                    setIsLocationValid(valid);
                    setLocationDistrict(district);
                  }}
                  placeholder="z.B. Musterstraße 1, Stadt"
                />
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Du hast keinen Standort in deinem Profil. Gib hier einen an.
                </p>
              </div>
            )}

            {userHasLocation && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Location (optional)
                </label>
                <LocationInput
                  value={customLocation}
                  onChange={setCustomLocation}
                  onValidated={(valid, district) => {
                    setIsLocationValid(valid);
                    setLocationDistrict(district);
                  }}
                  placeholder="Überschreibt deinen Profil-Standort"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          {step === 'details' && (
            <Button
              variant="outline"
              onClick={() => {
                setStep('isbn');
                setIsbn('');
              }}
            >
              Zurück
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          {step === 'details' && (
            <Button
              onClick={handleSubmit}
              disabled={
                createOffer.isPending ||
                (!userHasLocation && (!customLocation || !isLocationValid))
              }
            >
              {createOffer.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Erstelle...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Angebot erstellen
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>

      {showScanner && (
        <ISBNScanner
          onScan={(scannedIsbn) => {
            setIsbn(scannedIsbn);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </Dialog>
  );
}
