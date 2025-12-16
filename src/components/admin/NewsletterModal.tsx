'use client';

import { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function NewsletterModal({
  isOpen,
  onClose,
  onSend,
  isLoading,
}: NewsletterModalProps) {
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendClick = () => {
    if (message.trim().length < 10) {
      setError('Newsletter-Text muss mindestens 10 Zeichen lang sein');
      return;
    }
    if (message.trim().length > 5000) {
      setError('Newsletter-Text darf maximal 5000 Zeichen lang sein');
      return;
    }
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    try {
      await onSend(message);
      setMessage('');
      setShowConfirmation(false);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Newsletter-Versand fehlgeschlagen'
      );
      setShowConfirmation(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setMessage('');
      setError(null);
      setShowConfirmation(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {showConfirmation ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Newsletter wirklich versenden?
              </h2>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">
                    Der Newsletter wird an alle User versendet, die
                    Newsletter-Benachrichtigungen aktiviert haben.
                  </p>
                  <p className="mt-2">
                    Dieser Vorgang kann nicht rückgängig gemacht werden.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-medium text-gray-900">Vorschau:</h3>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {message}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Länge: {message.length} Zeichen
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={isLoading}
                className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Wird versendet...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Jetzt versenden
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Newsletter versenden
              </h2>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start">
                <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p>
                    Newsletter werden an alle aktiven User mit verifizierter
                    E-Mail versendet, die Newsletter-Benachrichtigungen
                    aktiviert haben.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start">
                  <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Newsletter-Text
                <span className="ml-1 text-gray-500">(10-5000 Zeichen)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(null);
                }}
                rows={12}
                placeholder="Schreibe hier deine Newsletter-Nachricht...&#10;&#10;Beispiel:&#10;Liebe Community,&#10;&#10;wir freuen uns, euch über die neuesten Entwicklungen zu informieren...&#10;&#10;Viele Grüße,&#10;Euer Admin-Team"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <div className="mt-1 text-xs text-gray-500">
                {message.length} / 5000 Zeichen
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSendClick}
                disabled={isLoading || message.trim().length < 10}
                className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="mr-2 h-4 w-4" />
                Weiter zur Bestätigung
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
