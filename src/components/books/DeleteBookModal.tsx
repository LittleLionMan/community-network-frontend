'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookTitle?: string;
  isPending?: boolean;
}

export function DeleteBookModal({
  isOpen,
  onClose,
  onConfirm,
  bookTitle,
  isPending = false,
}: DeleteBookModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          disabled={isPending}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Angebot löschen?
          </h2>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            Möchtest du dieses Angebot wirklich löschen?
          </p>
          {bookTitle && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {bookTitle}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isPending}
          >
            Abbrechen
          </Button>
          <Button
            variant="outline"
            onClick={onConfirm}
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? 'Wird gelöscht...' : 'Löschen'}
          </Button>
        </div>
      </div>
    </div>
  );
}
