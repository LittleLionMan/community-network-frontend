import { useState } from 'react';
import { X, AlertTriangle, Trash2, Check } from 'lucide-react';

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function AccountDeletionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: AccountDeletionModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [step, setStep] = useState(1);

  const REQUIRED_TEXT = 'DEAKTIVIEREN';
  const isConfirmationValid = confirmationText === REQUIRED_TEXT;

  const handleConfirm = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && isConfirmationValid) {
      await onConfirm();
    }
  };

  const handleClose = () => {
    setStep(1);
    setConfirmationText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Account deaktivieren
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">
                ⚠️ Wichtige Information
              </h3>
              <p className="mb-3 text-sm text-red-800">
                Ihr Account wird <strong>deaktiviert</strong>, nicht vollständig
                gelöscht. Das bedeutet:
              </p>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Sie können sich nicht mehr anmelden</li>
                <li>• Ihr Profil wird für andere nicht mehr sichtbar sein</li>
                <li>• Ihre Nachrichten und Inhalte bleiben bestehen</li>
                <li>• Eine Reaktivierung ist möglich (Support kontaktieren)</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-900">
                Alternativen zur Deaktivierung:
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Privacy-Einstellungen anpassen</li>
                <li>• E-Mail-Benachrichtigungen deaktivieren</li>
                <li>• Profil-Informationen entfernen</li>
                <li>• Temporäre Pause einlegen</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Trotzdem fortfahren
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="mb-3 text-sm text-red-800">
                <strong>Letzte Bestätigung:</strong> Um Ihren Account zu
                deaktivieren, geben Sie das Wort{' '}
                <code className="rounded bg-red-200 px-1 font-mono">
                  {REQUIRED_TEXT}
                </code>{' '}
                in das Feld unten ein.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmation"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Bestätigung eingeben:
              </label>
              <input
                id="confirmation"
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={REQUIRED_TEXT}
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  confirmationText && !isConfirmationValid
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {confirmationText && !isConfirmationValid && (
                <p className="mt-1 text-xs text-red-600">
                  Der eingegebene Text stimmt nicht überein
                </p>
              )}
              {isConfirmationValid && (
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Bestätigung korrekt
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Zurück
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || !isConfirmationValid}
                className="flex flex-1 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Deaktivieren...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Account deaktivieren
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
